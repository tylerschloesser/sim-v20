import clsx from 'clsx'
import {
  RefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import invariant from 'tiny-invariant'
import { AppContext } from './app-context'
import { EntityComponent } from './entity-component'
import { RobotComponent } from './robot-component'
import { Vec2 } from './vec2'

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

function useSmooth(
  container: RefObject<HTMLDivElement | null>,
  target: RefObject<Vec2>,
): void {
  useEffect(() => {
    let translate = target.current
    let lastFrame = self.performance.now()
    let handle: number
    const callback: FrameRequestCallback = () => {
      const now = self.performance.now()
      // @ts-expect-error
      const dt = now - lastFrame
      lastFrame = now

      if (!translate.equals(target.current)) {
        // const d = target.current.sub(translate)
        translate = target.current

        invariant(container.current)
        container.current.style.translate = `${translate.x}px ${translate.y}px`
      }

      handle = self.requestAnimationFrame(callback)
    }
    handle = self.requestAnimationFrame(callback)
    return () => {
      self.cancelAnimationFrame(handle)
    }
  }, [])
}
