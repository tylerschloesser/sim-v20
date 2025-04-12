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
import { Vec2 } from './vec2'

interface AppState {
  viewport: Vec2
  player: Vec2
}

interface AppContext {
  state: AppState
  setState: Updater<AppState>
}

const AppContext = React.createContext<AppContext>(null!)

function initState(): AppState {
  return {
    viewport: Vec2.ZERO,
    player: Vec2.ZERO,
  }
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
    <div className={clsx('w-dvh h-dvh')} ref={container}>
      <AppContext.Provider value={context}>
        <WorldComponent />
      </AppContext.Provider>
    </div>
  )
}

export function WorldComponent() {
  const { state } = useContext(AppContext)
  return <div>{state.viewport.toString()}</div>
}
