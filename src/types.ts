import { Vec2 } from './vec2'

export interface EntityBase {
  id: string
  position: Vec2
  size: Vec2
}

export interface RootEntity extends EntityBase {
  type: 'root'
}

export interface NodeEntity extends EntityBase {
  type: 'node'
}

export interface UndiscoveredEntity extends EntityBase {
  type: 'undiscovered'
  ticksRemaining: number
}

export type Item = 'wood' | 'stone' | 'iron' | 'gold'
export type Action = 'mine'

export type Entity =
  | RootEntity
  | NodeEntity
  | UndiscoveredEntity

export interface Player {
  position: Vec2
  size: Vec2
  energy: number
  inventory: Partial<Record<Item, number>>
  action: Action | null
}

export interface AppState {
  viewport: Vec2
  tick: number
  player: Player
  scale: number
  spread: number
  entities: Record<string, Entity>
}

export type Direction = 'up' | 'down' | 'left' | 'right'
