import invariant from 'tiny-invariant'
import {
  MAX_PLAYER_ENERGY,
  MINE_TICKS,
  ROOT_ENERGY_RECOVERY,
} from './const'
import { AppState, Item, NodeEntity } from './types'
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
    case 'node': {
      if (
        playerEntity.action === 'mine' &&
        draft.player.energy > 0
      ) {
        invariant(playerEntity.mineTicksRemaining > 0)
        draft.player.energy -= 1
        playerEntity.mineTicksRemaining -= 1
        if (playerEntity.mineTicksRemaining === 0) {
          const item: Item = 'wood'
          draft.player.inventory[item] =
            (draft.player.inventory[item] ?? 0) + 1
          playerEntity.mineTicksRemaining = MINE_TICKS
        }
      }
      break
    }
    case 'undiscovered': {
      if (
        playerEntity.action === 'discover' &&
        draft.player.energy > 0
      ) {
        invariant(playerEntity.discoverTicksRemaining > 0)

        playerEntity.discoverTicksRemaining -= 1
        draft.player.energy -= 1

        if (playerEntity.discoverTicksRemaining === 0) {
          const updatedEntity = (draft.entities[
            playerEntity.id
          ] = {
            id: playerEntity.id,
            position: playerEntity.position,
            size: playerEntity.size,
            type: 'node',
            action: null,
            mineTicksRemaining: MINE_TICKS,
          } satisfies NodeEntity)
          onVisitEntity(draft, updatedEntity)
        }
      }
      break
    }
  }
}
