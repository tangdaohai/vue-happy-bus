import { ComponentInternalInstance, getCurrentInstance, onUnmounted } from 'vue'
import Emitter, { EventNameType, EventCallback, ListenStopHandle } from 'happy-event-bus'

const eventMap = new WeakMap<ComponentInternalInstance, Array<ListenStopHandle>>()
const emitter = new Emitter()
const markOnUnmounted = new WeakSet<ComponentInternalInstance>()

const markListenHandle = (stopHandle: ListenStopHandle) => {
  // get vue instance
  let vm: ComponentInternalInstance | null = getCurrentInstance()
  if (vm === null) {
    // error. please call '$on/$once' on setup or Lifecycle Hooks
    return
  }
  const list = eventMap.get(vm) || eventMap.set(vm, []).get(vm)
  list?.push(stopHandle)

  // onUnmounted and mark it
  if (!markOnUnmounted.has(vm)) {
    markOnUnmounted.add(vm)
    onUnmounted(() => {
      const stopHandleList = vm && eventMap.get(vm)
      stopHandleList?.forEach(val => val())
      // gc
      vm = null
    }, vm)
  }
}

export const $on = (type: EventNameType, callback: EventCallback): ListenStopHandle => {
  const stopHandle = emitter.on(type, callback)
  markListenHandle(stopHandle)
  return stopHandle
}
export const $once = (type: EventNameType, callback: EventCallback): ListenStopHandle => {
  const stopHandle = emitter.once(type, callback)
  markListenHandle(stopHandle)
  return stopHandle
}
export const $off = emitter.off
export const $emit = emitter.emit
