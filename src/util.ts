import { Vec2 } from './vec2'

export function entityPositionToId(position: Vec2): string {
  return `${position.x},${position.y}`
}
