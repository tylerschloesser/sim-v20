import clsx from 'clsx'
import {
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import invariant from 'tiny-invariant'
import { AppContext } from './app-context'
import { MAX_ROBOT_ENERGY, MINE_TICKS } from './const'
import { Inventory, Robot } from './types'
import {
  useEntityOrRobotStyle,
  useRobotTranslate,
} from './use-entity-style'
import { positionToId } from './util'

export interface RobotComponentProps {
  robotId: string
}

export function RobotComponent({
  robotId,
}: RobotComponentProps) {
  const { state } = useContext(AppContext)

  const robot = state.robots[robotId]
  invariant(robot)

  const style = useEntityOrRobotStyle(state, robot)
  const translate = useRobotTranslate(state, robot)
  const target = useRef(translate)
  useEffect(() => {
    target.current = translate
  }, [translate])

  invariant(robot.energy <= MAX_ROBOT_ENERGY)
  invariant(robot.energy >= 0)

  return (
    <div className={clsx('absolute')} style={style}>
      <div
        className={clsx(
          'absolute inset-0',
          'border-2 border-black',
        )}
      ></div>
      <div
        className={clsx(
          'absolute bottom-full p-1',
          'text-xs',
        )}
      ></div>
      <Status robot={robot} />
      <EnergyBar energy={robot.energy} />
      <InventoryGrid inventory={robot.inventory} />
      <ActionDisplay robot={robot} />
    </div>
  )
}

interface StatusProps {
  robot: Robot
}

function Status({ robot }: StatusProps) {
  const { state } = useContext(AppContext)
  const label =
    state.cursor.attachedRobotId === robot.id
      ? '[attached]'
      : '[detached]'
  return (
    <div
      className={clsx(
        'absolute bottom-full left-0 right-0',
        'pb-2',
        'text-xs text-center',
      )}
    >
      {label}
    </div>
  )
}

interface EnergyBarProps {
  energy: number
}

function EnergyBar({ energy }: EnergyBarProps) {
  return (
    <div
      className={clsx(
        'absolute right-full top-0 bottom-0',
        'pr-2',
        'flex flex-row',
        'text-xs',
      )}
    >
      <div
        className={clsx(
          'flex-1 relative',
          'w-4',
          'border-2 border-black',
        )}
      >
        <div
          className={clsx(
            'absolute inset-0',
            'bg-green-400',
            'origin-bottom',
          )}
          style={{
            scale: `1 ${Math.floor((energy / MAX_ROBOT_ENERGY) * 100)}%`,
          }}
        />
      </div>
    </div>
  )
}

interface InventoryGridProps {
  inventory: Inventory
}

function InventoryGrid({ inventory }: InventoryGridProps) {
  return (
    <div
      className={clsx('absolute left-full top-0', 'pl-2')}
    >
      <div
        className={clsx(
          'grid grid-cols-[1fr_1fr] gap-1',
          'text-xs',
        )}
      >
        {Object.entries(inventory).map(([item, count]) => (
          <Fragment key={item}>
            <div>{item}</div>
            <div>{count}</div>
          </Fragment>
        ))}
      </div>
    </div>
  )
}

interface ActionDisplayProps {
  robot: Robot
}

function ActionDisplay({ robot }: ActionDisplayProps) {
  const { state } = useContext(AppContext)
  const currentEntity =
    state.entities[positionToId(robot.position)]
  invariant(currentEntity)

  const { action, progress } = useMemo(() => {
    switch (currentEntity.type) {
      case 'resource': {
        const mineTicksRequired = MINE_TICKS
        const progress =
          1 -
          currentEntity.mineTicksRemaining /
            mineTicksRequired
        return { action: 'mine', progress }
      }
      case 'undiscovered': {
        const progress =
          1 -
          currentEntity.discoverTicksRemaining /
            currentEntity.discoverTicksRequired
        return { action: 'discover', progress }
      }
      default: {
        return { action: null, progress: 0 }
      }
    }
  }, [currentEntity])

  const label = `[${action ?? 'none'}]`

  return (
    <div
      className={clsx(
        'absolute top-full left-0 right-0',
        'pt-2',
        'text-xs',
      )}
    >
      <div
        className={clsx(
          'border-2 border-black p-1 relative',
          'text-center',
        )}
      >
        <div
          className={clsx(
            'absolute inset-0 bg-gray-300',
            'origin-left',
          )}
          style={{
            scale: `${progress} 1`,
          }}
        />
        <div className="relative">{label}</div>
      </div>
    </div>
  )
}
