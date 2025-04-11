import {
  state,
  StateObservable,
  Subscribe,
  useStateObservable,
} from '@react-rxjs/core'
import clsx from 'clsx'
import { isEqual } from 'lodash-es'
import {
  createContext,
  PointerEventHandler,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  takeUntil,
} from 'rxjs'
import invariant from 'tiny-invariant'
import './index.css'
import { PointerController } from './pointer-controller'
import { useEffectWithDestroy } from './use-effect-with-destroy'
import { Vec2 } from './vec2'

interface Entity {
  id: string
  position: Vec2
  size: Vec2
}

interface World {
  entities: Record<string, Entity>
  nextEntityId: number
}

interface AppContext {
  world$: StateObservable<World>
}

const AppContext = createContext<AppContext>(null!)

function initWorld(): World {
  const world: World = {
    entities: {},
    nextEntityId: 0,
  }
  function addEntity({
    position,
    size,
  }: Omit<Entity, 'id'>) {
    const id = `${world.nextEntityId++}`
    world.entities[id] = {
      id,
      position: position,
      size: size,
    }
  }
  addEntity({
    position: new Vec2(0, 0),
    size: new Vec2(1, 1),
  })
  addEntity({
    position: new Vec2(2, 0),
    size: new Vec2(1, 1),
  })
  return world
}

const world$ = new BehaviorSubject<World>(initWorld())
const viewport$ = new BehaviorSubject<Vec2>(
  new Vec2(window.innerWidth, window.innerHeight),
)
const boundingBox$ = world$.pipe(
  map((world) => {
    let tl = new Vec2(Number.MAX_SAFE_INTEGER)
    let br = new Vec2(Number.MIN_SAFE_INTEGER)
    Object.values(world.entities).forEach((entity) => {
      tl = tl.min(entity.position)
      br = br.max(entity.position.add(entity.size))
    })
    const size = br.sub(tl)
    return { position: tl, size }
  }),
  distinctUntilChanged(isEqual),
)

const transform$ = combineLatest([
  viewport$,
  boundingBox$,
]).pipe(
  map(([viewport, boundingBox]) => {
    const scale = Math.min(
      viewport.x / boundingBox.size.x,
      viewport.y / boundingBox.size.y,
    )
    return {
      translate: Vec2.ZERO,
      scale,
    }
  }),
)

export function App() {
  const context = useMemo<AppContext>(() => {
    return {
      world$: state(world$),
    }
  }, [])
  return (
    <Subscribe>
      <AppContext value={context}>
        <div
          className={clsx(
            'absolute',
            'bottom-0 right-0',
            'pointer-events-none select-none',
            'p-1',
            'font-mono text-xs opacity-50',
          )}
        >
          {0}
        </div>
        <EntityComponentGrid />
        <div
          className={clsx(
            'absolute',
            'pointer-events-none',
          )}
        >
          <Rect />
        </div>
      </AppContext>
    </Subscribe>
  )
}

function EntityComponentGrid() {
  const { world$ } = useContext(AppContext)
  const world = useStateObservable(world$)
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={ref}
      className={clsx('absolute origin-top-left')}
    >
      {Object.values(world.entities).map((entity) => (
        <EntityComponent key={entity.id} entity={entity} />
      ))}
    </div>
  )
}

interface EntityComponentProps {
  entity: Entity
}

function EntityComponent({ entity }: EntityComponentProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffectWithDestroy(
    (destroy$) => {
      transform$
        .pipe(takeUntil(destroy$))
        .subscribe(({ translate, scale }) => {
          invariant(ref.current)
          const { x, y } = entity.position
            .add(translate)
            .mul(scale)
          console.log(x, y)
          ref.current.style.translate = `${x}px ${y}px`
        })
    },
    [entity.position],
  )

  useEffectWithDestroy(
    (destroy$) => {
      transform$
        .pipe(takeUntil(destroy$))
        .subscribe(({ scale }) => {
          invariant(ref.current)
          ref.current.style.width = `${entity.size.x * scale}px`
          ref.current.style.height = `${entity.size.y * scale}px`
        })
    },
    [entity.size],
  )

  return (
    <div
      ref={ref}
      className={clsx(
        'absolute',
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
      document.body.classList.add('cursor-pointer')
      document.body.classList.add('select-none')
      new PointerController({
        pointerId: ev.pointerId,
        container: container.current,
        onDrag: (drag) => {
          invariant(container.current)
          position.current = position.current.add(drag)
          const { x, y } = position.current
          container.current.style.transform = `translate(${x}px, ${y}px)`
        },
        onComplete: () => {
          setDown(false)
        },
      })
    }, [])

  useEffect(() => {
    // remove from body AFTER this component is updated
    if (!down) {
      document.body.classList.remove('cursor-pointer')
      document.body.classList.remove('select-none')
    }
  }, [down])

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
