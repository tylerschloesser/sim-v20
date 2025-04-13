import clsx from 'clsx'
import {
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { AppContext } from './app-context'
import { EntityComponent } from './entity-component'
import { RobotComponent } from './robot-component'
import { useSmooth } from './use-smooth'

export function WorldComponent() {
  const container = useRef<HTMLDivElement>(null)
  const { state } = useContext(AppContext)
  const entityIds = Object.keys(state.entities)
  const robotIds = Object.keys(state.robots)

  const { cursor } = state

  const translate = useMemo(() => {
    return cursor.position.mul(
      state.scale * state.spread * -1,
    )
  }, [cursor.position, state.scale, state.spread])

  const target = useRef(translate)

  useEffect(() => {
    target.current = translate
  }, [translate])

  useSmooth(container, target)

  return (
    <div
      className={clsx('absolute inset-0 overflow-hidden')}
    >
      <div ref={container} className={clsx('absolute')}>
        {robotIds.map((robotId) => (
          <RobotComponent key={robotId} robotId={robotId} />
        ))}
        {entityIds.map((entityId) => (
          <EntityComponent
            key={entityId}
            entityId={entityId}
          />
        ))}
      </div>
    </div>
  )
}
