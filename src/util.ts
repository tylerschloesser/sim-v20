import { isInteger } from 'lodash-es'
import invariant from 'tiny-invariant'
import {
  AppState,
  NodeEntity,
  RootEntity,
  UndiscoveredEntity,
} from './types'
import { Vec2 } from './vec2'

export function entityPositionToId(position: Vec2): string {
  return `${position.x},${position.y}`
}

export function addEntity(
  state: AppState,
  partial:
    | Omit<RootEntity, 'id'>
    | Omit<NodeEntity, 'id'>
    | Omit<UndiscoveredEntity, 'id'>,
): void {
  invariant(isInteger(partial.position.x))
  invariant(isInteger(partial.position.y))
  const id = entityPositionToId(partial.position)
  invariant(!state.entities[id])
  state.entities[id] = { ...partial, id }
}

export function move(draft: AppState, delta: Vec2): void {
  const targetPosition = draft.player.position.add(delta)
  const targetEntityId = entityPositionToId(targetPosition)
  const targetEntity = draft.entities[targetEntityId]
  if (!targetEntity) {
    return
  }

  draft.player.position = targetPosition

  if (targetEntity.type === 'undiscovered') {
    return
  }

  for (const delta of [
    new Vec2(0, 1),
    new Vec2(1, 0),
    new Vec2(0, -1),
    new Vec2(-1, 0),
  ]) {
    const neighborPosition = targetPosition.add(delta)
    const neighborId = entityPositionToId(neighborPosition)
    const neighborEntity = draft.entities[neighborId]

    const ticksRemaining = Math.floor(
      (neighborPosition.length() * 10) ** 2,
    )

    if (!neighborEntity) {
      addEntity(draft, {
        type: 'undiscovered',
        position: neighborPosition,
        size: new Vec2(1, 1),
        ticksRemaining,
      })
    }
  }
}
