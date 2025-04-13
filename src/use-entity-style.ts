import React, { useMemo } from 'react'
import { AppState } from './types'
import { Vec2 } from './vec2'

export function useEntityStyle(
  state: AppState,
  entity: { position: Vec2; size: Vec2 },
): React.CSSProperties {
  return useEntityOrRobotStyle(state, entity)
}

function useEntityOrRobotStyle(
  state: AppState,
  entity: { position: Vec2; size: Vec2 },
): React.CSSProperties {
  const translate = useMemo(
    () =>
      entity.position
        .mul(state.scale * state.spread)
        .add(state.viewport.div(2))
        .sub(entity.size.mul(state.scale / 2)),
    [entity, state.scale, state.spread, state.viewport],
  )
  return useMemo(
    () => ({
      translate: `${translate.x}px ${translate.y}px`,
      width: `${entity.size.x * state.scale}px`,
      height: `${entity.size.y * state.scale}px`,
    }),
    [translate, entity.size, state.scale],
  )
}
