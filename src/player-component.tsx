import clsx from 'clsx'
import { Fragment, useContext, useMemo } from 'react'
import invariant from 'tiny-invariant'
import { AppContext } from './app-context'
import { MAX_PLAYER_ENERGY, MINE_TICKS } from './const'
import { Action, Inventory } from './types'
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
      >
        Player
      </div>
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

  const availableAction = useMemo<Action | null>(() => {
    const currentEntity =
      state.entities[
        entityPositionToId(state.player.position)
      ]
    invariant(currentEntity)
    if (currentEntity.type === 'node') {
      return 'mine'
    }
    return null
  }, [state.player, state.entities])

  if (state.player.action) {
    invariant(state.player.action === availableAction)
  }

  if (availableAction === 'mine') {
    return <MineActionDisplay />
  }

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
          'border-2 border-black p-1',
          'text-center',
          {
            'opacity-50': !availableAction,
            'bg-blue-400': state.player.action,
          },
        )}
      >
        {availableAction
          ? `[${availableAction}]`
          : '[none]'}
      </div>
    </div>
  )
}

function MineActionDisplay() {
  const { state } = useContext(AppContext)
  const currentEntity =
    state.entities[
      entityPositionToId(state.player.position)
    ]
  invariant(currentEntity)
  invariant(currentEntity.type === 'node')

  const progress = useMemo(() => {
    return 1 - currentEntity.mineTicksRemaining / MINE_TICKS
  }, [currentEntity.mineTicksRemaining])

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
            'absolute inset-0 bg-blue-400',
            'origin-left',
          )}
          style={{
            scale: `${progress} 1`,
          }}
        />
        <div className="relative">[mine]</div>
      </div>
    </div>
  )
}
