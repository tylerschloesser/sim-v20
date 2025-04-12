import invariant from 'tiny-invariant'
import {
  MAX_PLAYER_ENERGY,
  MINE_TICKS,
  ROOT_ENERGY_RECOVERY,
} from './const'
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
        draft.player.energy = Math.min(
          draft.player.energy + ROOT_ENERGY_RECOVERY,
          MAX_PLAYER_ENERGY,
        )
      }
      break
    }
    case 'undiscovered': {
      if (draft.player.energy === 0) {
        break
      }
      invariant(playerEntity.discoverTicksRemaining > 0)

      playerEntity.discoverTicksRemaining -= 1
      draft.player.energy -= 1

      if (playerEntity.discoverTicksRemaining === 0) {
        const updatedEntity = (draft.entities[
          playerEntity.id
        ] = {
          ...playerEntity,
          type: 'node',
          mineTicksRemaining: MINE_TICKS,
        })
        onVisitEntity(draft, updatedEntity)
      }
      break
    }
  }
}
