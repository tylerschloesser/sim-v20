import clsx from 'clsx'
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import invariant from 'tiny-invariant'
import { Updater, useImmer } from 'use-immer'
import './index.css'
import { initState } from './init-state'
import {
  AppState,
  Direction,
  UndiscoveredEntity,
} from './types'
import { move } from './util'
import { Vec2 } from './vec2'

export interface AppContext {
  state: AppState
  setState: Updater<AppState>
}
const AppContext = React.createContext<AppContext>(null!)

export function App() {
  const container = useRef<HTMLDivElement>(null)
  const [state, setState] = useImmer<AppState>(initState)

  const tryMove = useTryMove(setState)

  useViewport(container, setState)
  useKeyboard(tryMove)

  useEffect(() => {
    const interval = self.setInterval(() => {
      setState((draft) => {
        draft.tick += 1
      })
    }, 100)
    return () => {
      self.clearInterval(interval)
    }
  }, [])

  return (
    <div className={clsx('w-dvw h-dvh')} ref={container}>
      <AppContext.Provider
        value={useMemo(
          () => ({
            state,
            setState,
          }),
          [state, setState],
        )}
      >
        <WorldComponent />
        <TickComponent />
      </AppContext.Provider>
    </div>
  )
}

function TickComponent() {
  const { state } = useContext(AppContext)
  return (
    <div
      className={clsx(
        'absolute top-0 left-0',
        'p-1',
        'text-xs font-mono opacity-50',
      )}
    >
      {state.tick}
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

  let body: React.ReactNode
  switch (entity.type) {
    case 'undiscovered':
      body = (
        <UndiscoveredEntityComponentBody entity={entity} />
      )
      break
    default:
      body = <>{entity.type}</>
  }

  return (
    <div
      className={clsx(
        'absolute',
        'border-2 border-black',
        'overflow-hidden',
        {
          'opacity-20': entity.type === 'undiscovered',
        },
      )}
      style={style}
    >
      {body}
    </div>
  )
}

interface UndiscoveredEntityComponentProps {
  entity: UndiscoveredEntity
}
// @ts-expect-error
function UndiscoveredEntityComponentBody({
  entity,
}: UndiscoveredEntityComponentProps) {
  return <>TODO</>
}

function useKeyboard(
  tryMove: ReturnType<typeof useTryMove>,
) {
  useEffect(() => {
    const abortController = new AbortController()
    const { signal } = abortController
    window.addEventListener(
      'keydown',
      (ev) => {
        let direction: Direction | null = null
        switch (ev.code) {
          case 'KeyW': {
            direction = 'up'
            break
          }
          case 'KeyA': {
            direction = 'left'
            break
          }
          case 'KeyS': {
            direction = 'down'
            break
          }
          case 'KeyD': {
            direction = 'right'
            break
          }
        }
        if (direction) {
          tryMove(direction)
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

function useTryMove(setState: Updater<AppState>) {
  return useCallback(
    (direction: Direction) => {
      setState((draft) => {
        let delta: Vec2
        switch (direction) {
          case 'up':
            delta = new Vec2(0, -1)
            break
          case 'down':
            delta = new Vec2(0, 1)
            break
          case 'left':
            delta = new Vec2(-1, 0)
            break
          case 'right':
            delta = new Vec2(1, 0)
            break
        }
        move(draft, delta)
      })
    },
    [setState],
  )
}
