import React, { useMemo } from 'react'
import { AppState } from './types'
import { Vec2 } from './vec2'

export function useEntityStyle(
  state: AppState,
  entity: { position: Vec2; size: Vec2 },
): React.CSSProperties {
  return useEntityOrRobotStyle(state, entity)
}

export function useEntityOrRobotStyle(
  state: AppState,
  entity: { position: Vec2; size: Vec2 },
): React.CSSProperties {
  const translate = useEntityOrRobotTranslate(state, entity)
  return useMemo(
    () => ({
      translate: `${translate.x}px ${translate.y}px`,
      width: `${entity.size.x * state.scale}px`,
      height: `${entity.size.y * state.scale}px`,
    }),
    [translate, entity.size, state.scale],
  )
}

function useEntityOrRobotTranslate(
  state: AppState,
  entity: { position: Vec2; size: Vec2 },
): Vec2 {
  return useMemo(
    () =>
      entity.position
        .mul(state.scale * state.spread)
        .add(state.viewport.div(2))
        .sub(entity.size.mul(state.scale / 2)),
    [entity, state.scale, state.spread, state.viewport],
  )
}
