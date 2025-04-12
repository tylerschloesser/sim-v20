import clsx from 'clsx'
import { isInteger } from 'lodash-es'
import React, {
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import invariant from 'tiny-invariant'
import { Updater, useImmer } from 'use-immer'
import './index.css'
import { entityPositionToId } from './util'
import { Vec2 } from './vec2'

interface EntityBase {
  id: string
  position: Vec2
  size: Vec2
}

interface RootEntity extends EntityBase {
  type: 'root'
}

interface NodeEntity extends EntityBase {
  type: 'node'
}

type Entity = RootEntity | NodeEntity

interface Player {
  position: Vec2
  size: Vec2
}

interface AppState {
  viewport: Vec2
  player: Player
  scale: number
  spread: number
  entities: Record<string, Entity>
}

interface AppContext {
  state: AppState
  setState: Updater<AppState>
}

const AppContext = React.createContext<AppContext>(null!)

function initState(): AppState {
  const state: AppState = {
    viewport: Vec2.ZERO,
    player: {
      position: Vec2.ZERO,
      size: new Vec2(1.5),
    },
    scale: 1,
    spread: 3,
    entities: {},
  }

  function addEntity(partial: Omit<Entity, 'id'>): void {
    invariant(isInteger(partial.position.x))
    invariant(isInteger(partial.position.y))
    const id = entityPositionToId(partial.position)
    invariant(!state.entities[id])
    state.entities[id] = { ...partial, id }
  }

  addEntity({
    type: 'root',
    position: Vec2.ZERO,
    size: new Vec2(1, 1),
  })
  addEntity({
    type: 'node',
    position: new Vec2(1, 0),
    size: new Vec2(1, 1),
  })
  addEntity({
    type: 'node',
    position: new Vec2(0, 1),
    size: new Vec2(1, 1),
  })
  addEntity({
    type: 'node',
    position: new Vec2(-1, 0),
    size: new Vec2(1, 1),
  })
  addEntity({
    type: 'node',
    position: new Vec2(0, -1),
    size: new Vec2(1, 1),
  })

  return state
}

export function App() {
  const container = useRef<HTMLDivElement>(null)
  const [state, setState] = useImmer<AppState>(initState)

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

  const context = useMemo(
    () => ({
      state,
      setState,
    }),
    [state, setState],
  )

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
    return {}
  }, [])

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
