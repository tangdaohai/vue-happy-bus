import Vue$ from 'vue'
import { version } from './package.json'
let Vue = Vue$
if (typeof window !== 'undefined' && window.Vue) {
  Vue = window.Vue
}

// 记录所有的事件类型与事件函数
const EventStore = {}
const Bus = new Vue()

// 移除所有事件的方法
const destroyHandler = function () {
  // this 为调用此方法的vue组件
  const currentEventObj = EventStore[this._uid]
  if (typeof currentEventObj === 'undefined') {
    return
  }
  for (let type in currentEventObj) {
    const key = Array.isArray(type) ? type.join(',') : type
    // Bus 解绑事件
    Bus.$off(type, currentEventObj[key])
  }
  // 删除记录的事件集合
  delete EventStore[this._uid]
}

const BusFactory = vm => {
  // 当前调用组件的 destroyed 钩子
  const destroyed = vm.$options.destroyed
  // 当前组件的唯一标示(vue生成的自增ID)
  const uid = vm._uid
  // 初始化当前组件的事件集合对象
  EventStore[uid] = {}
  // 为当前组件挂载destroyed钩子
  !destroyed.includes(destroyHandler) && destroyed.push(destroyHandler)

  return {
    $on: (type, handler) => {
      const key = Array.isArray(type) ? type.join(',') : type
      EventStore[uid][key] = handler
      Bus.$on(type, handler)
    },
    $off: (type, handler) => {
      // $off() 时 type 为空，移除所有事件
      if (!type) {
        // 删除该uid下事件集合
        delete EventStore[uid]
        Bus.$off()
        return
      }
      const key = Array.isArray(type) ? type.join(',') : type
      // 删除对应的事件
      delete EventStore[uid][key]
      Bus.$off(type, handler)
    },
    $once: (...params) => Bus.$once(...params),
    $emit: (...params) => Bus.$emit(...params)
  }
}

BusFactory.$emit = (...params) => Bus.$emit(...params)
BusFactory.$once = (...params) => Bus.$once(...params)

export default BusFactory
export { Bus, version }
