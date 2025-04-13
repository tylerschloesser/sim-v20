import { isInteger } from 'lodash-es'
import invariant from 'tiny-invariant'
import {
  DISCOVERY_CONSTANT,
  DISCOVERY_EXPONENT,
  MAX_ROBOT_ENERGY,
  MINE_TICKS,
} from './const'
import {
  AppState,
  Entity,
  NodeEntity,
  ResourceEntity,
  Robot,
  RootEntity,
  UndiscoveredEntity,
} from './types'
import { Vec2 } from './vec2'

export function positionToId(position: Vec2): string {
  return `${position.x},${position.y}`
}

export function addEntity(
  state: AppState,
  partial:
    | Omit<RootEntity, 'id'>
    | Omit<ResourceEntity, 'id'>
    | Omit<UndiscoveredEntity, 'id'>
    | Omit<NodeEntity, 'id'>,
): Entity {
  invariant(isInteger(partial.position.x))
  invariant(isInteger(partial.position.y))
  const id = positionToId(partial.position)
  invariant(!state.entities[id])
  return (state.entities[id] = { ...partial, id })
}

export function addResourceEntity(
  state: AppState,
  partial: Omit<
    ResourceEntity,
    'id' | 'action' | 'mineTicksRemaining'
  >,
): void {
  addEntity(state, {
    ...partial,
    action: null,
    mineTicksRemaining: MINE_TICKS,
  })
}

export function move(draft: AppState, delta: Vec2): void {
  const targetPosition = draft.cursor.position.add(delta)
  const targetEntityId = positionToId(targetPosition)
  const targetEntity = draft.entities[targetEntityId]
  if (!targetEntity) {
    return
  }

  draft.cursor.position = targetPosition

  if (draft.cursor.attachedRobotId) {
    const robot = draft.robots[draft.cursor.attachedRobotId]
    invariant(robot)
    robot.position = targetPosition
  }

  if (targetEntity.type === 'undiscovered') {
    return
  }

  if (targetEntity.type === 'resource') {
    onVisitEntity(draft, targetEntity)
  }
}

export function onVisitEntity(
  draft: AppState,
  entity: ResourceEntity | RootEntity,
): void {
  for (const delta of [
    new Vec2(0, 2),
    new Vec2(2, 0),
    new Vec2(0, -2),
    new Vec2(-2, 0),
  ]) {
    const neighborPosition = entity.position.add(delta)
    const neighborId = positionToId(neighborPosition)
    const neighborEntity = draft.entities[neighborId]

    if (!neighborEntity) {
      const discoverTicksRequired = Math.floor(
        (neighborPosition.length() * DISCOVERY_CONSTANT) **
          DISCOVERY_EXPONENT,
      )
      addEntity(draft, {
        type: 'undiscovered',
        position: neighborPosition,
        size: new Vec2(1, 1),
        action: 'discover',
        discoverTicksRequired,
        discoverTicksRemaining: discoverTicksRequired,
      })
    }
  }

  for (const delta of [
    new Vec2(-1, -1),
    new Vec2(0, -1),
    new Vec2(1, -1),
    new Vec2(-1, 0),
    new Vec2(1, 0),
    new Vec2(-1, 1),
    new Vec2(0, 1),
    new Vec2(1, 1),
  ]) {
    const neighborPosition = entity.position.add(delta)
    const neighborId = positionToId(neighborPosition)
    const neighborEntity = draft.entities[neighborId]

    if (!neighborEntity) {
      addEntity(draft, {
        type: 'node',
        position: neighborPosition,
        size: new Vec2(0.2, 0.2),
      })
    }
  }
}

export function ticksToSeconds(ticks: number): number {
  return Math.ceil(ticks / 10)
}

export function formatSeconds(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secondsLeft = Math.floor(seconds % 60)
  return `${minutes}:${String(secondsLeft).padStart(2, '0')}`
}

export function toggleAction(draft: AppState): void {
  const currentEntityId = positionToId(
    draft.cursor.position,
  )
  const currentEntity = draft.entities[currentEntityId]
  invariant(currentEntity)

  switch (currentEntity.type) {
    case 'undiscovered': {
      currentEntity.action =
        currentEntity.action === null ? 'discover' : null
      break
    }
    case 'resource': {
      currentEntity.action =
        currentEntity.action === null ? 'mine' : null
      break
    }
  }
}

export function addRobot(draft: AppState): Robot {
  const id = `${draft.nextRobotId++}`
  invariant(!draft.robots[id])
  return (draft.robots[id] = {
    id,
    position: Vec2.ZERO,
    size: new Vec2(1.5),
    energy: MAX_ROBOT_ENERGY,
    inventory: {},
  })
}
