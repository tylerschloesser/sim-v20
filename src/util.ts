import { AppState } from './types'
import { Vec2 } from './vec2'

export function entityPositionToId(position: Vec2): string {
  return `${position.x},${position.y}`
}

export function move(draft: AppState, delta: Vec2): void {
  draft.player.position = draft.player.position.add(delta)
  const targetEntityId = entityPositionToId(
    draft.player.position,
  )
  const targetEntity = draft.entities[targetEntityId]
  if (targetEntity) {
    draft.player.position = targetEntity.position
  }
}
