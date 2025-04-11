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
import { PointerController } from './pointer-controller'

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
      invariant(container.current)
      new PointerController({
        pointerId: ev.pointerId,
        container: container.current,
        onDrag: (drag) => {
          console.log('drag', drag)
        },
      })
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
