import { RefObject, useEffect } from 'react'
import invariant from 'tiny-invariant'
import { Vec2 } from './vec2'

export interface SmoothConfig {
  exponent: number
  constant: number
}

export function useSmooth(
  container: RefObject<HTMLDivElement | null>,
  target: RefObject<Vec2>,
  config: SmoothConfig = {
    exponent: 1.4,
    constant: 0.8,
  },
): void {
  useEffect(() => {
    let translate = target.current
    let lastFrame = self.performance.now()
    let handle: number
    const callback: FrameRequestCallback = () => {
      const now = self.performance.now()
      const dt = (now - lastFrame) / 1000
      lastFrame = now

      translate = smooth(
        translate,
        target.current,
        dt,
        config,
      )

      invariant(container.current)
      container.current.style.translate = `${translate.x}px ${translate.y}px`

      handle = self.requestAnimationFrame(callback)
    }
    handle = self.requestAnimationFrame(callback)
    return () => {
      self.cancelAnimationFrame(handle)
    }
  }, [])
}

function smooth(
  current: Vec2,
  target: Vec2,
  dt: number,
  config: SmoothConfig,
): Vec2 {
  if (current.equals(target)) {
    return current
  }

  const d = target.sub(current)
  const len = d.length()

  if (len < 0.01) {
    return target
  }

  const v = d
    .normalize()
    .mul((len + 1) ** config.exponent - 1)
    .mul(config.constant)

  if (v.mul(dt).length() > len) {
    return target
  }

  return current.add(v.mul(dt))
}
