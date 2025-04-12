import { isInteger } from 'lodash-es'
import invariant from 'tiny-invariant'
import { AppState, Entity } from './types'
import { entityPositionToId } from './util'
import { Vec2 } from './vec2'

export function initState(): AppState {
  const state: AppState = {
    viewport: Vec2.ZERO,
    tick: 0,
    player: {
      position: Vec2.ZERO,
      size: new Vec2(1.5),
    },
    scale: 1,
    spread: 3,
    entities: {},
  }

  function addEntity(partial: Omit<Entity, 'id'>): void {
    invariant(isInteger(partial.position.x))
    invariant(isInteger(partial.position.y))
    const id = entityPositionToId(partial.position)
    invariant(!state.entities[id])
    state.entities[id] = { ...partial, id }
  }

  addEntity({
    type: 'root',
    position: Vec2.ZERO,
    size: new Vec2(1, 1),
  })
  addEntity({
    type: 'node',
    position: new Vec2(1, 0),
    size: new Vec2(1, 1),
  })
  addEntity({
    type: 'node',
    position: new Vec2(0, 1),
    size: new Vec2(1, 1),
  })
  addEntity({
    type: 'node',
    position: new Vec2(-1, 0),
    size: new Vec2(1, 1),
  })
  addEntity({
    type: 'node',
    position: new Vec2(0, -1),
    size: new Vec2(1, 1),
  })

  return state
}
