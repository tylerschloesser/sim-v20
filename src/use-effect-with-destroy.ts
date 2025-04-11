import { useEffect } from 'react'
import { Subject } from 'rxjs'

/**
 * A helper hook to simplify RxJS takeUntil unsubscription pattern,
 * while supporting dependency tracking like useEffect.
 *
 * @param effect A function that receives `destroy$` and runs side effects.
 * @param deps Dependency array to control when the effect runs.
 */
export function useEffectWithDestroy(
  effect: (destroy$: Subject<void>) => void | (() => void),
  deps: React.DependencyList,
) {
  useEffect(() => {
    const destroy$ = new Subject<void>()
    const cleanup = effect(destroy$)

    return () => {
      destroy$.next()
      destroy$.complete()
      if (typeof cleanup === 'function') {
        cleanup()
      }
    }
  }, deps)
}
