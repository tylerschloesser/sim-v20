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
      <div className={clsx('absolute bottom-full')}>
        Player
      </div>
    </div>
  )
}
