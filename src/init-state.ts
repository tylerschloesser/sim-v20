import invariant from 'tiny-invariant'
import { MAX_PLAYER_ENERGY, SPREAD } from './const'
import { AppState } from './types'
import {
  addEntity,
  addResourceEntity,
  onVisitEntity,
} from './util'
import { Vec2 } from './vec2'

export function initState(): AppState {
  const state: AppState = {
    viewport: Vec2.ZERO,
    tick: 0,
    player: {
      position: Vec2.ZERO,
      size: new Vec2(1.5),
      energy: MAX_PLAYER_ENERGY,
      inventory: {
        wood: 10,
        stone: 5,
      },
    },
    scale: 1,
    spread: SPREAD,
    entities: {},
  }

  const root = addEntity(state, {
    type: 'root',
    position: Vec2.ZERO,
    size: new Vec2(1, 1),
  })
  invariant(root.type === 'root')

  addResourceEntity(state, {
    type: 'resource',
    position: new Vec2(2, 0),
    size: new Vec2(1, 1),
  })
  addResourceEntity(state, {
    type: 'resource',
    position: new Vec2(0, 2),
    size: new Vec2(1, 1),
  })
  addResourceEntity(state, {
    type: 'resource',
    position: new Vec2(-2, 0),
    size: new Vec2(1, 1),
  })
  addResourceEntity(state, {
    type: 'resource',
    position: new Vec2(0, -2),
    size: new Vec2(1, 1),
  })

  onVisitEntity(state, root)

  return state
}
