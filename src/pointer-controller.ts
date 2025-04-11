import { Vec2 } from './vec2'

type DragCallback = (delta: Vec2) => void

export interface PointerControllerConstructorArgs {
  pointerId: number
  container: HTMLElement
  onDrag: DragCallback
}

export class PointerController {
  pointerId: number
  abortController: AbortController = new AbortController()
  lastPosition: Vec2 | null = null
  onDrag: DragCallback

  constructor({
    pointerId,
    // @ts-ignore
    container,
    onDrag,
  }: PointerControllerConstructorArgs) {
    this.pointerId = pointerId
    this.onDrag = () => {}
    const { signal } = this.abortController
    this.onDrag = onDrag

    function filter(fn: (ev: PointerEvent) => void) {
      return (ev: PointerEvent) => {
        if (ev.pointerId === pointerId) {
          fn(ev)
        }
      }
    }

    document.addEventListener(
      'pointermove',
      filter(this.onPointerMove),
      { signal },
    )

    document.addEventListener(
      'pointerup',
      filter(this.onPointerUp),
      { signal },
    )
  }

  onPointerMove = (ev: PointerEvent) => {
    const position = new Vec2(ev.clientX, ev.clientY)
    if (this.lastPosition) {
      const delta = position.sub(this.lastPosition)
      this.onDrag(delta)
    }
    this.lastPosition = position
  }

  onPointerUp = (ev: PointerEvent) => {
    console.log('onPointerUp', ev)
    this.abortController.abort()
  }
}
