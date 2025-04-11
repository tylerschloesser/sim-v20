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
interface PointerControllerConstructorArgs {
  container: HTMLElement
}

class PointerController {
  constructor({
    container,
  }: PointerControllerConstructorArgs) {
    console.log(container)
  }
}

function App() {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    invariant(container.current)
  }, [])

  const onPointerDown: PointerEventHandler<HTMLDivElement> =
    // @ts-expect-error
    useCallback((ev) => {
      invariant(container.current)
      new PointerController({
        container: container.current,
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
