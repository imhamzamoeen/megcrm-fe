import mitt from "mitt";
const emitter = mitt()

export const EventBus = {
  $on: (...args: any) => emitter.on(...args),
  $off: (...args: any) => emitter.off(...args),
  $emit: (...args: any) => emitter.emit(...args)
}
