import clsx from 'clsx'
import React, { useContext } from 'react'
import invariant from 'tiny-invariant'
import { AppContext } from './app-context'
import {
  ResourceEntity,
  RootEntity,
  UndiscoveredEntity,
} from './types'
import { useEntityStyle } from './use-entity-style'
import { formatSeconds, ticksToSeconds } from './util'

export interface EntityComponentProps {
  entityId: string
}

export function EntityComponent({
  entityId,
}: EntityComponentProps) {
  const { state } = useContext(AppContext)
  const entity = state.entities[entityId]
  invariant(entity)

  const style = useEntityStyle(state, entity)

  let body: React.ReactNode
  switch (entity.type) {
    case 'root': {
      body = <RootEntityComponentBody entity={entity} />
      break
    }
    case 'resource': {
      body = <ResourceEntityComponentBody entity={entity} />
      break
    }
    case 'undiscovered':
      body = (
        <UndiscoveredEntityComponentBody entity={entity} />
      )
      break
  }

  return (
    <div
      className={clsx(
        'absolute',
        'border-2 border-black',
        'overflow-hidden',
        {
          'opacity-20': entity.type === 'undiscovered',
        },
      )}
      style={style}
    >
      {body}
    </div>
  )
}

interface UndiscoveredEntityComponentBodyProps {
  entity: UndiscoveredEntity
}
function UndiscoveredEntityComponentBody({
  entity,
}: UndiscoveredEntityComponentBodyProps) {
  const seconds = ticksToSeconds(
    entity.discoverTicksRemaining,
  )
  return (
    <div
      className={clsx(
        'w-full h-full',
        'p-1',
        'flex justify-center items-center',
        'text-xs',
      )}
    >
      {formatSeconds(seconds)}
    </div>
  )
}

interface RootEntityComponentBodyProps {
  entity: RootEntity
}
// @ts-expect-error
function RootEntityComponentBody({
  entity,
}: RootEntityComponentBodyProps) {
  return (
    <div
      className={clsx(
        'w-full h-full',
        'p-1',
        'flex justify-center items-center',
        'bg-green-400',
      )}
    ></div>
  )
}

interface ResourceEntityComponentBodyProps {
  entity: ResourceEntity
}
// @ts-expect-error
function ResourceEntityComponentBody({
  entity,
}: ResourceEntityComponentBodyProps) {
  return (
    <div
      className={clsx(
        'w-full h-full',
        'p-1',
        'flex justify-center items-center',
      )}
    ></div>
  )
}
