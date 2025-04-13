import clsx from 'clsx'
import React, {
  RefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import invariant from 'tiny-invariant'
import { Updater, useImmer } from 'use-immer'
import { AppContext } from './app-context'
import { TICK_DURATION } from './const'
import { EntityComponent } from './entity-component'
import { initState } from './init-state'
import { RobotComponent } from './robot-component'
import { tickState } from './tick-state'
import { AppState } from './types'
import {
  attachOrDetachRobot,
  move,
  toggleAction,
} from './util'
import { Vec2 } from './vec2'

export function App() {
  const container = useRef<HTMLDivElement>(null)
  const [state, setState] = useImmer<AppState>(initState)

  useViewport(container, setState)
  useKeyboard(setState)

  useEffect(() => {
    const interval = self.setInterval(() => {
      setState(tickState)
    }, TICK_DURATION)
    return () => {
      self.clearInterval(interval)
    }
  }, [])

  return (
    <div
      className={clsx('w-dvw h-dvh relative')}
      ref={container}
    >
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

function useKeyboard(setState: Updater<AppState>) {
  useEffect(() => {
    const abortController = new AbortController()
    const { signal } = abortController
    window.addEventListener(
      'keydown',
      (ev) => {
        setState((draft) => {
          switch (ev.code) {
            case 'KeyW': {
              move(draft, new Vec2(0, -2))
              break
            }
            case 'KeyA': {
              move(draft, new Vec2(-2, 0))
              break
            }
            case 'KeyS': {
              move(draft, new Vec2(0, 2))
              break
            }
            case 'KeyD': {
              move(draft, new Vec2(2, 0))
              break
            }
            case 'Space': {
              toggleAction(draft)
              break
            }
            case 'KeyQ': {
              attachOrDetachRobot(draft)
              break
            }
          }
        })
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
