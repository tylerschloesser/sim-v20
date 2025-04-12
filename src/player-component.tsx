import clsx from 'clsx'
import { Fragment, useContext } from 'react'
import invariant from 'tiny-invariant'
import { AppContext } from './app-context'
import { MAX_PLAYER_ENERGY } from './const'
import { Inventory } from './types'
import { useEntityStyle } from './use-entity-style'

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
      >
        Player
      </div>
      <EnergyBar energy={state.player.energy} />
      <InventoryGrid inventory={state.player.inventory} />
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
        className={clsx('grid grid-cols-[1fr_1fr] gap-1')}
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
