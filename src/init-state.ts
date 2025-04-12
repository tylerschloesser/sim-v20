import { MAX_PLAYER_ENERGY, SPREAD } from './const'
import { AppState } from './types'
import { addEntity } from './util'
import { Vec2 } from './vec2'

export function initState(): AppState {
  const state: AppState = {
    viewport: Vec2.ZERO,
    tick: 0,
    player: {
      position: Vec2.ZERO,
      size: new Vec2(1.5),
      energy: MAX_PLAYER_ENERGY,
    },
    scale: 1,
    spread: SPREAD,
    entities: {},
  }

  addEntity(state, {
    type: 'root',
    position: Vec2.ZERO,
    size: new Vec2(1, 1),
  })
  addEntity(state, {
    type: 'node',
    position: new Vec2(1, 0),
    size: new Vec2(1, 1),
  })
  addEntity(state, {
    type: 'node',
    position: new Vec2(0, 1),
    size: new Vec2(1, 1),
  })
  addEntity(state, {
    type: 'node',
    position: new Vec2(-1, 0),
    size: new Vec2(1, 1),
  })
  addEntity(state, {
    type: 'node',
    position: new Vec2(0, -1),
    size: new Vec2(1, 1),
  })

  return state
}
