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
  mineTicksRemaining: number
}

export interface UndiscoveredEntity extends EntityBase {
  type: 'undiscovered'
  discoverTicksRemaining: number
}

export type Item = 'wood' | 'stone' | 'iron' | 'gold'
export type Action = 'mine'

export type Entity =
  | RootEntity
  | NodeEntity
  | UndiscoveredEntity

export type Inventory = Partial<Record<Item, number>>

export interface Player {
  position: Vec2
  size: Vec2
  energy: number
  inventory: Inventory
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
