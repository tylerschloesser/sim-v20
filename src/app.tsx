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
import { initState } from './init-state'
import { tickState } from './tick-state'
import { AppState } from './types'
import {
  attachOrDetachRobot,
  move,
  toggleAction,
} from './util'
import { Vec2 } from './vec2'
import { WorldComponent } from './world-component'

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
