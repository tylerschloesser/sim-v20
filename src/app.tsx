import clsx from 'clsx'
import React, {
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import invariant from 'tiny-invariant'
import { Updater, useImmer } from 'use-immer'
import './index.css'
import { initState } from './init-state'
import { AppState } from './types'
import { entityPositionToId } from './util'
import { Vec2 } from './vec2'

export interface AppContext {
  state: AppState
  setState: Updater<AppState>
}
const AppContext = React.createContext<AppContext>(null!)

export function App() {
  const container = useRef<HTMLDivElement>(null)
  const [state, setState] = useImmer<AppState>(initState)

  useViewport(container, setState)
  useKeyboard(setState)

  const context = useMemo(
    () => ({
      state,
      setState,
    }),
    [state, setState],
  )

  return (
    <div className={clsx('w-dvw h-dvh')} ref={container}>
      <AppContext.Provider value={context}>
        <WorldComponent />
      </AppContext.Provider>
    </div>
  )
}

export function WorldComponent() {
  const { state } = useContext(AppContext)
  const entityIds = Object.keys(state.entities)

  const style = useMemo<React.CSSProperties>(() => {
    const { x, y } = state.player.position.mul(
      state.scale * state.spread * -1,
    )
    return {
      translate: `${x}px ${y}px`,
    }
  }, [state.player.position, state.scale, state.spread])

  return (
    <div className={clsx('absolute')} style={style}>
      <PlayerComponent />
      {entityIds.map((entityId) => (
        <EntityComponent
          key={entityId}
          entityId={entityId}
        />
      ))}
    </div>
  )
}

function useStyle(
  state: AppState,
  entity: { position: Vec2; size: Vec2 },
): React.CSSProperties {
  const translate = useMemo(
    () =>
      entity.position
        .mul(state.scale * state.spread)
        .add(state.viewport.div(2))
        .sub(entity.size.mul(state.scale / 2)),
    [entity, state.scale, state.spread, state.viewport],
  )
  return useMemo(
    () => ({
      translate: `${translate.x}px ${translate.y}px`,
      width: `${entity.size.x * state.scale}px`,
      height: `${entity.size.y * state.scale}px`,
    }),
    [translate, entity.size, state.scale],
  )
}

export function PlayerComponent() {
  const { state } = useContext(AppContext)
  const style = useStyle(state, state.player)
  return (
    <div className={clsx('absolute')} style={style}>
      <div
        className={clsx(
          'absolute inset-0',
          'border-2 border-black',
        )}
      ></div>
      <div className={clsx('absolute bottom-full')}>
        Player
      </div>
    </div>
  )
}

interface EntityComponentProps {
  entityId: string
}

export function EntityComponent({
  entityId,
}: EntityComponentProps) {
  const { state } = useContext(AppContext)
  const entity = state.entities[entityId]
  invariant(entity)

  const style = useStyle(state, entity)

  return (
    <div
      className={clsx('absolute', 'border-2 border-black')}
      style={style}
    >
      {entity.type}
    </div>
  )
}

function useKeyboard(setState: Updater<AppState>) {
  useEffect(() => {
    const abortController = new AbortController()
    const { signal } = abortController
    window.addEventListener(
      'keydown',
      (ev) => {
        let delta: Vec2 | null = null
        switch (ev.code) {
          case 'KeyW': {
            delta = new Vec2(0, -1)
            break
          }
          case 'KeyA': {
            delta = new Vec2(-1, 0)
            break
          }
          case 'KeyS': {
            delta = new Vec2(0, 1)
            break
          }
          case 'KeyD': {
            delta = new Vec2(1, 0)
            break
          }
        }
        if (delta) {
          setState((draft) => {
            const targetEntityId = entityPositionToId(
              draft.player.position.add(delta),
            )
            const targetEntity =
              draft.entities[targetEntityId]
            if (targetEntity) {
              draft.player.position = targetEntity.position
            }
          })
        }
      },
      { signal },
    )
    return () => {
      abortController.abort()
    }
  }, [])
}

function useViewport(
  container: React.RefObject<HTMLDivElement | null>,
  setState: Updater<AppState>,
) {
  useEffect(() => {
    invariant(container.current)
    const resizeObserver = new ResizeObserver((entries) => {
      invariant(entries.length === 1)
      const entry = entries.at(0)
      invariant(entry)
      setState((draft) => {
        draft.viewport = new Vec2(
          entry.contentRect.width,
          entry.contentRect.height,
        )
        draft.scale =
          Math.min(
            entry.contentRect.width,
            entry.contentRect.height,
          ) * 0.1
      })
    })
    resizeObserver.observe(container.current)
    return () => {
      resizeObserver.disconnect()
    }
  }, [setState])
}
