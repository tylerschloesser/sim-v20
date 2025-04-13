import { SmoothConfig } from './use-smooth'

export const TICK_DURATION = 100

export const SPREAD = 1.5

export const DISCOVERY_CONSTANT = 1.5
export const DISCOVERY_EXPONENT = 2.5

export const MAX_ROBOT_ENERGY = 1000
export const ROOT_ENERGY_RECOVERY = 4

export const MINE_TICKS = 20

export const ROBOT_SMOOTH_CONFIG: SmoothConfig = {
  exponent: 1.3,
  constant: 1.1,
}

export const WORLD_SMOOTH_CONFIG: SmoothConfig = {
  exponent: 1.2,
  constant: 2,
}
