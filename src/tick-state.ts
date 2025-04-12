import { AppState } from './types'

export function tickState(draft: AppState): void {
  draft.tick += 1
}
