import clsx from 'clsx'
import {
  createContext,
  PointerEventHandler,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { BehaviorSubject } from 'rxjs'
import invariant from 'tiny-invariant'
import { Updater, useImmer } from 'use-immer'
import './index.css'
import { PointerController } from './pointer-controller'
import { Vec2 } from './vec2'

const viewport$ = new BehaviorSubject<Vec2>(
  new Vec2(window.innerWidth, window.innerHeight),
)

interface Entity {
  id: string
  position: Vec2
  size: Vec2
}

interface AppState {
  tick: number
  over: boolean
  entities: Record<string, Entity>
  nextEntityId: number
  scale: number
}

const AppContext = createContext<{
  state: AppState
  setState: Updater<AppState>
}>(null!)

function initState(): AppState {
  const scale = Math.min(
    viewport$.value.x,
    viewport$.value.y,
  )
  const state: AppState = {
    tick: 0,
    over: false,
    entities: {},
    nextEntityId: 0,
    scale,
  }

  function addEntity({
    position,
    size,
  }: Omit<Entity, 'id'>) {
    const id = `${state.nextEntityId++}`
    state.entities[id] = {
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

  return state
}

export function App() {
  const [state, setState] = useImmer<AppState>(initState)

  useEffect(() => {
    const interval = self.setInterval(() => {
      setState((draft) => {
        draft.tick++
      })
    }, 100)
    return () => {
      self.clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    console.log('over', state.over)
  }, [state.over])

  return (
    <AppContext value={{ state, setState }}>
      <div
        className={clsx(
          'absolute',
          'bottom-0 right-0',
          'pointer-events-none select-none',
          'p-1',
          'font-mono text-xs opacity-50',
        )}
      >
        {state.tick}
      </div>
      {Object.values(state.entities).map((entity) => (
        <EntityComponent key={entity.id} entity={entity} />
      ))}
      <div
        className={clsx('absolute', 'pointer-events-none')}
      >
        <Rect />
      </div>
    </AppContext>
  )
}

interface EntityComponentProps {
  entity: Entity
}

function EntityComponent({ entity }: EntityComponentProps) {
  const {
    state: { scale },
  } = useContext(AppContext)
  const { setState } = useContext(AppContext)
  const setOver = useCallback(
    (over: boolean) => {
      setState((draft) => {
        draft.over = over
      })
    },
    [setState],
  )

  return (
    <div
      onPointerOver={() => {
        setOver(true)
      }}
      onPointerOut={() => {
        setOver(false)
      }}
      style={{
        width: entity.size.x * scale,
        height: entity.size.y * scale,
        transform: `translate(${entity.position.x * scale}px, ${entity.position.y * scale}px)`,
      }}
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
