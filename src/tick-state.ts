import invariant from 'tiny-invariant'
import {
  MAX_ROBOT_ENERGY,
  MINE_TICKS,
  ROOT_ENERGY_RECOVERY,
} from './const'
import { AppState, Item, ResourceEntity } from './types'
import { entityPositionToId, onVisitEntity } from './util'

export function tickState(draft: AppState): void {
  draft.tick += 1

  invariant(draft.robot.energy >= 0)

  const robotEntity =
    draft.entities[entityPositionToId(draft.robot.position)]
  invariant(robotEntity)

  switch (robotEntity.type) {
    case 'root': {
      if (draft.robot.energy < MAX_ROBOT_ENERGY) {
        draft.robot.energy = Math.min(
          draft.robot.energy + ROOT_ENERGY_RECOVERY,
          MAX_ROBOT_ENERGY,
        )
      }
      break
    }
    case 'resource': {
      if (
        robotEntity.action === 'mine' &&
        draft.robot.energy > 0
      ) {
        invariant(robotEntity.mineTicksRemaining > 0)
        draft.robot.energy -= 1
        robotEntity.mineTicksRemaining -= 1
        if (robotEntity.mineTicksRemaining === 0) {
          const item: Item = 'wood'
          draft.robot.inventory[item] =
            (draft.robot.inventory[item] ?? 0) + 1
          robotEntity.mineTicksRemaining = MINE_TICKS
        }
      }
      break
    }
    case 'undiscovered': {
      if (
        robotEntity.action === 'discover' &&
        draft.robot.energy > 0
      ) {
        invariant(robotEntity.discoverTicksRemaining > 0)

        robotEntity.discoverTicksRemaining -= 1
        draft.robot.energy -= 1

        if (robotEntity.discoverTicksRemaining === 0) {
          const updatedEntity = (draft.entities[
            robotEntity.id
          ] = {
            id: robotEntity.id,
            position: robotEntity.position,
            size: robotEntity.size,
            type: 'resource',
            action: null,
            mineTicksRemaining: MINE_TICKS,
          } satisfies ResourceEntity)
          onVisitEntity(draft, updatedEntity)
        }
      }
      break
    }
  }
}
