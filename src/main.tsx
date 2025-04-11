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
import { Vec2 } from './vec2'

const container = document.getElementById('root')
invariant(container)

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
interface PointerControllerConstructorArgs {
  pointerId: number
  container: HTMLElement
}

class PointerController {
  pointerId: number
  abortController: AbortController = new AbortController()
  lastPosition: Vec2 | null = null

  constructor({
    pointerId,
    // @ts-ignore
    container,
  }: PointerControllerConstructorArgs) {
    this.pointerId = pointerId
    const { signal } = this.abortController

    document.addEventListener(
      'pointermove',
      (ev) => {
        if (ev.pointerId === this.pointerId) {
          this.onPointerMove(ev)
        }
        const position = new Vec2(ev.clientX, ev.clientY)
        if (this.lastPosition) {
          const delta = position.sub(this.lastPosition)
          console.log('delta', delta)
        }
        this.lastPosition = position
      },
      { signal },
    )

    document.addEventListener(
      'pointerup',
      (ev) => {
        if (ev.pointerId === this.pointerId) {
          this.onPointerUp(ev)
        }
      },
      { signal },
    )
  }

  onPointerMove = (ev: PointerEvent) => {
    console.log('onPointerMove', ev)
  }

  onPointerUp = (ev: PointerEvent) => {
    console.log('onPointerUp', ev)
    this.abortController.abort()
  }
}

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
