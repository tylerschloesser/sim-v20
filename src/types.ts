import { Vec2 } from './vec2'

export interface EntityBase {
  id: string
  position: Vec2
  size: Vec2
}

export interface RootEntity extends EntityBase {
  type: 'root'
}

export interface ResourceEntity extends EntityBase {
  type: 'resource'
  action: 'mine' | null
  mineTicksRemaining: number
}

export interface UndiscoveredEntity extends EntityBase {
  type: 'undiscovered'
  action: 'discover' | null
  discoverTicksRequired: number
  discoverTicksRemaining: number
}

export interface NodeEntity extends EntityBase {
  type: 'node'
}

export type Item = 'wood' | 'stone' | 'iron' | 'gold'
export type Action = 'mine' | 'discover'

export type Entity =
  | RootEntity
  | ResourceEntity
  | UndiscoveredEntity
  | NodeEntity

export type Inventory = Partial<Record<Item, number>>

export interface Robot {
  id: string
  position: Vec2
  size: Vec2
  energy: number
  inventory: Inventory
}

export interface Cursor {
  position: Vec2
  attachedRobotId: string | null
}

export interface AppState {
  viewport: Vec2
  tick: number
  robots: Record<string, Robot>
  nextRobotId: number
  cursor: Cursor
  scale: number
  spread: number
  entities: Record<string, Entity>
}
