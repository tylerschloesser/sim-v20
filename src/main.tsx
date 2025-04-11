import clsx from 'clsx'
import {
  PointerEventHandler,
  StrictMode,
  useCallback,
  useEffect,
  useRef,
} from 'react'
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

  const onPointerDown: PointerEventHandler<HTMLDivElement> =
    useCallback((ev) => {
      console.log(ev)
    }, [])

  return (
    <div
      onPointerDown={onPointerDown}
      className={clsx(
        'w-40 h-40',
        'bg-red-500 border-2 border-black',
        'cursor-pointer',
      )}
      ref={container}
    >
      TODO
    </div>
  )
}
