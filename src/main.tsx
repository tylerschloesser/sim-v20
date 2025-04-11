import clsx from 'clsx'
import { StrictMode, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import invariant from 'tiny-invariant'
import './index.css'

const container = document.getElementById('root')
invariant(container)

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

function App() {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    invariant(container.current)
  }, [])

  return (
    <div
      className={clsx(
        'w-20 h-20',
        'bg-red-500 border-2 border-black',
        'cursor-pointer',
      )}
      ref={container}
    >
      TODO
    </div>
  )
}
