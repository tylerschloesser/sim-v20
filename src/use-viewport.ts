import React, { useEffect, useState } from 'react'
import invariant from 'tiny-invariant'
import { Vec2 } from './vec2'

export function useViewport(
  container: React.RefObject<HTMLDivElement | null>,
): Vec2 | null {
  const [viewport, setViewport] = useState<Vec2 | null>(
    null,
  )

  useEffect(() => {
    invariant(container.current)
    const resizeObserver = new ResizeObserver((entries) => {
      invariant(entries.length === 1)
      const entry = entries.at(0)
      invariant(entry)
      setViewport(
        new Vec2(
          entry.contentRect.width,
          entry.contentRect.height,
        ),
      )
    })
    resizeObserver.observe(container.current)
    return () => {
      resizeObserver.disconnect()
    }
  }, [setViewport])

  return viewport
}
