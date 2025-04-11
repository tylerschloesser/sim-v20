import clsx from 'clsx'
import {
  createContext,
  PointerEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  shareReplay,
} from 'rxjs'
import invariant from 'tiny-invariant'
import './index.css'
import { PointerController } from './pointer-controller'
import { Vec2 } from './vec2'

const viewport$ = new BehaviorSubject<Vec2>(
  new Vec2(window.innerWidth, window.innerHeight),
)

const AppContext = createContext(null)

export function App() {
  return (
    <AppContext value={null}>
      <Resource />
      <div
        className={clsx('absolute', 'pointer-events-none')}
      >
        <Rect />
      </div>
    </AppContext>
  )
}

function Resource() {
  const container = useRef<HTMLDivElement>(null)
  useEffect(() => {
    invariant(container.current)
    const rect$ = new BehaviorSubject<DOMRectReadOnly>(
      container.current.getBoundingClientRect(),
    )
    const resizeObserver = new ResizeObserver((entries) => {
      invariant(entries.length === 1)
      const entry = entries.at(0)
      invariant(entry)
      rect$.next(entry.contentRect)
    })
    resizeObserver.observe(container.current)
    const size$ = rect$.pipe(
      map((rect) => new Vec2(rect.width, rect.height)),
      distinctUntilChanged(),
      shareReplay(1),
    )

    combineLatest([viewport$, size$]).subscribe(
      ([viewport, size]) => {
        invariant(container.current)
        const { x, y } = viewport.div(2).sub(size.div(2))
        // prettier-ignore
        container.current.style.transform = `translate(${x}px, ${y}px)`
      },
    )

    return () => {
      resizeObserver.disconnect()
      rect$.complete() // TODO what is this?
    }
  }, [])
  return (
    <div
      ref={container}
      onPointerOver={() => {
        console.log('enter!')
      }}
      className={clsx(
        'absolute',
        'w-40 h-40 p-2',
        'border-2 border-black bg-red-300',
      )}
    >
      Iron
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
