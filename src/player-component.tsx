import clsx from 'clsx'
import { Fragment, useContext, useMemo } from 'react'
import invariant from 'tiny-invariant'
import { AppContext } from './app-context'
import { MAX_PLAYER_ENERGY, MINE_TICKS } from './const'
import { Inventory } from './types'
import { useEntityStyle } from './use-entity-style'
import { entityPositionToId } from './util'

export function PlayerComponent() {
  const { state } = useContext(AppContext)
  const style = useEntityStyle(state, state.player)

  invariant(state.player.energy <= MAX_PLAYER_ENERGY)
  invariant(state.player.energy >= 0)

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
      <EnergyBar energy={state.player.energy} />
      <InventoryGrid inventory={state.player.inventory} />
      <ActionDisplay />
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
            scale: `1 ${Math.floor((energy / MAX_PLAYER_ENERGY) * 100)}%`,
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

function ActionDisplay() {
  const { state } = useContext(AppContext)

  const currentEntity =
    state.entities[
      entityPositionToId(state.player.position)
    ]
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
