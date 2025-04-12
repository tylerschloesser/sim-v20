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

interface AppState {
  viewport: Vec2
  player: Vec2
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
    player: Vec2.ZERO,
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
  return (
    <div>
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

export function PlayerComponent() {
  const { state } = useContext(AppContext)

  const translate = state.player
    .mul(state.scale)
    .add(state.viewport.div(2))
    .sub(state.scale / 2)

  return (
    <div
      className={clsx('absolute', 'border-2 border-black')}
      style={{
        translate: `${translate.x}px ${translate.y}px`,
        width: `${state.scale}px`,
        height: `${state.scale}px`,
      }}
    >
      {state.player.toString()}
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

  const translate = entity.position
    .mul(state.scale * state.spread)
    .add(state.viewport.div(2))
    .sub(state.scale / 2)

  return (
    <div
      className={clsx('absolute')}
      style={{
        translate: `${translate.x}px ${translate.y}px`,
        width: `${entity.size.x * state.scale}px`,
        height: `${entity.size.y * state.scale}px`,
      }}
    >
      {entity.type}
    </div>
  )
}
