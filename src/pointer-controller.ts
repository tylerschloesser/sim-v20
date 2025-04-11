import { Vec2 } from './vec2'

export interface PointerControllerConstructorArgs {
  pointerId: number
  container: HTMLElement
}

export class PointerController {
  pointerId: number
  abortController: AbortController = new AbortController()
  lastPosition: Vec2 | null = null

  constructor({
    pointerId,
    // @ts-ignore
    container,
  }: PointerControllerConstructorArgs) {
    this.pointerId = pointerId
    const { signal } = this.abortController

    document.addEventListener(
      'pointermove',
      (ev) => {
        if (ev.pointerId === this.pointerId) {
          this.onPointerMove(ev)
        }
        const position = new Vec2(ev.clientX, ev.clientY)
        if (this.lastPosition) {
          const delta = position.sub(this.lastPosition)
          console.log('delta', delta)
        }
        this.lastPosition = position
      },
      { signal },
    )

    document.addEventListener(
      'pointerup',
      (ev) => {
        if (ev.pointerId === this.pointerId) {
          this.onPointerUp(ev)
        }
      },
      { signal },
    )
  }

  onPointerMove = (ev: PointerEvent) => {
    console.log('onPointerMove', ev)
  }

  onPointerUp = (ev: PointerEvent) => {
    console.log('onPointerUp', ev)
    this.abortController.abort()
  }
}
