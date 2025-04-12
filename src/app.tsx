import clsx from 'clsx'
import React, { useContext, useMemo, useRef } from 'react'
import './index.css'
import { useViewport } from './use-viewport'
import { Vec2 } from './vec2'

interface AppContext {
  viewport: Vec2
}

const AppContext = React.createContext<AppContext>(null!)

export function App() {
  const container = useRef<HTMLDivElement>(null)
  const viewport = useViewport(container)
  const context = useMemo<AppContext | null>(
    () => (viewport ? { viewport } : null),
    [viewport],
  )
  return (
    <div className={clsx('w-dvh h-dvh')} ref={container}>
      {context && (
        <AppContext.Provider value={context}>
          <WorldComponent />
        </AppContext.Provider>
      )}
    </div>
  )
}

export function WorldComponent() {
  const { viewport } = useContext(AppContext)
  return <div>{viewport.toString()}</div>
}
