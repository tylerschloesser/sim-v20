import invariant from 'tiny-invariant'
import { MAX_PLAYER_ENERGY } from './const'
import { AppState } from './types'
import { entityPositionToId, onVisitEntity } from './util'

export function tickState(draft: AppState): void {
  draft.tick += 1

  invariant(draft.player.energy >= 0)

  const playerEntity =
    draft.entities[
      entityPositionToId(draft.player.position)
    ]
  invariant(playerEntity)

  switch (playerEntity.type) {
    case 'root': {
      if (draft.player.energy < MAX_PLAYER_ENERGY) {
        draft.player.energy += 1
      }
      break
    }
    case 'undiscovered': {
      if (draft.player.energy === 0) {
        break
      }
      invariant(playerEntity.ticksRemaining > 0)

      playerEntity.ticksRemaining -= 1
      draft.player.energy -= 1

      if (playerEntity.ticksRemaining === 0) {
        const updatedEntity = (draft.entities[
          playerEntity.id
        ] = {
          ...playerEntity,
          type: 'node',
        })
        onVisitEntity(draft, updatedEntity)
      }
      break
    }
  }
}
