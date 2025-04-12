import React from 'react'
import { Updater } from 'use-immer'
import { AppState } from './types'

export interface AppContext {
  state: AppState
  setState: Updater<AppState>
}

export const AppContext = React.createContext<AppContext>(
  null!,
)
