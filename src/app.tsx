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
import { AppContext } from './app-context'
import { TICK_DURATION } from './const'
import { EntityComponent } from './entity-component'
import { initState } from './init-state'
import { PlayerComponent } from './player-component'
import { tickState } from './tick-state'
import { AppState, Direction } from './types'
import { move } from './util'
import { Vec2 } from './vec2'

export function App() {
  const container = useRef<HTMLDivElement>(null)
  const [state, setState] = useImmer<AppState>(initState)

  const tryMove = useTryMove(setState)

  useViewport(container, setState)
  useKeyboard(tryMove)

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

  const style = useMemo<React.CSSProperties>(() => {
    const { x, y } = state.player.position.mul(
      state.scale * state.spread * -1,
    )
    return {
      translate: `${x}px ${y}px`,
    }
  }, [state.player.position, state.scale, state.spread])

  return (
    <div
      className={clsx('absolute inset-0 overflow-hidden')}
    >
      <div className={clsx('absolute')} style={style}>
        <PlayerComponent />
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
