import clsx from 'clsx'
import {
  PointerEventHandler,
  StrictMode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { createRoot } from 'react-dom/client'
import { BehaviorSubject } from 'rxjs'
import invariant from 'tiny-invariant'
import './index.css'
import { PointerController } from './pointer-controller'
import { Vec2 } from './vec2'

const container = document.getElementById('root')
invariant(container)

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// @ts-expect-error
const viewport$ = new BehaviorSubject<Vec2>(
  new Vec2(window.innerWidth, window.innerHeight),
)

function App() {
  return (
    <>
      <div
        className={clsx('absolute', 'pointer-events-none')}
      >
        <Rect />
      </div>
      <Resource />
    </>
  )
}

function Resource() {
  return (
    <div className="w-dvw h-dvh flex items-center justify-center">
      <div
        onPointerOver={() => {
          console.log('enter!')
        }}
        className={clsx(
          'w-40 h-40 p-2',
          'border-2 border-black bg-red-300',
        )}
      >
        Iron
      </div>
    </div>
  )
}

function Rect() {
  const container = useRef<HTMLDivElement>(null)
  const position = useRef<Vec2>(Vec2.ZERO)
  const [down, setDown] = useState(false)

  useEffect(() => {
    invariant(container.current)
  }, [])

  const onPointerDown: PointerEventHandler<HTMLDivElement> =
    useCallback((ev) => {
      invariant(container.current)
      setDown(true)
      new PointerController({
        pointerId: ev.pointerId,
        container: container.current,
        onDrag: (drag) => {
          invariant(container.current)
          position.current = position.current.add(drag)
          const { x, y } = position.current
          container.current.style.transform = `translate(${x}px, ${y}px)`

          document.body.classList.add('cursor-pointer')
          document.body.classList.add('select-none')
        },
        onComplete: () => {
          setDown(false)
          document.body.classList.remove('cursor-pointer')
          document.body.classList.remove('select-none')
        },
      })
    }, [])

  return (
    <div
      ref={container}
      className={clsx('absolute', 'w-40 h-40')}
    >
      <div
        onPointerDown={onPointerDown}
        className={clsx(
          'absolute',
          'inset-0',
          'border-2 border-black',
          'cursor-pointer',
          down
            ? 'pointer-events-none'
            : 'pointer-events-auto',
        )}
      ></div>
      <div
        className={clsx(
          'absolute',
          'bottom-full',
          'pointer-events-auto',
        )}
      >
        TODO
      </div>
    </div>
  )
}
