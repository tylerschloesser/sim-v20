import clsx from 'clsx'
import { useContext } from 'react'
import { AppContext } from './app-context'
import { useEntityStyle } from './use-entity-style'

export function PlayerComponent() {
  const { state } = useContext(AppContext)
  const style = useEntityStyle(state, state.player)
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
            'flex-1',
            'w-4',
            'bg-green-400',
            'border-2 border-black',
          )}
        ></div>
      </div>
    </div>
  )
}
