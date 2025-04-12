import { isInteger } from 'lodash-es'
import invariant from 'tiny-invariant'
import { AppState, Entity } from './types'
import { Vec2 } from './vec2'

export function entityPositionToId(position: Vec2): string {
  return `${position.x},${position.y}`
}

export function addEntity(
  state: AppState,
  partial: Omit<Entity, 'id'>,
): void {
  invariant(isInteger(partial.position.x))
  invariant(isInteger(partial.position.y))
  const id = entityPositionToId(partial.position)
  invariant(!state.entities[id])
  state.entities[id] = { ...partial, id }
}

export function move(draft: AppState, delta: Vec2): void {
  draft.player.position = draft.player.position.add(delta)
  const targetEntityId = entityPositionToId(
    draft.player.position,
  )
  const targetEntity = draft.entities[targetEntityId]
  invariant(targetEntity)

  for (const delta of [
    new Vec2(0, 1),
    new Vec2(1, 0),
    new Vec2(0, -1),
    new Vec2(-1, 0),
  ]) {
    const neighborPosition =
      targetEntity.position.add(delta)
    const neighborId = entityPositionToId(neighborPosition)
    const neighborEntity = draft.entities[neighborId]
    if (!neighborEntity) {
      addEntity(draft, {
        type: 'undiscovered',
        position: neighborPosition,
        size: new Vec2(1, 1),
      })
    }
  }
}
