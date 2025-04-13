import clsx from 'clsx'
import React, {
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
import { move, toggleAction } from './util'
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

export function WorldComponent() {
  const { state } = useContext(AppContext)
  const entityIds = Object.keys(state.entities)
  const robotIds = Object.keys(state.robots)

  const robot = Object.values(state.robots).at(0)
  invariant(robot)

  const style = useMemo<React.CSSProperties>(() => {
    const { x, y } = robot.position.mul(
      state.scale * state.spread * -1,
    )
    return {
      translate: `${x}px ${y}px`,
    }
  }, [robot.position, state.scale, state.spread])

  return (
    <div
      className={clsx('absolute inset-0 overflow-hidden')}
    >
      <div className={clsx('absolute')} style={style}>
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
