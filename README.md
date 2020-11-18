vue-happy-bus
===
[![Github Actions Test](https://github.com/tangdaohai/vue-happy-bus/workflows/Unit%20Test/badge.svg)](https://github.com/tangdaohai/vue-happy-bus/actions?query=workflow%3A%22Unit+Test%22)
<a href="https://www.npmjs.com/package/vue-happy-bus"><img src="https://img.shields.io/npm/dm/vue-happy-bus.svg" alt="Downloads"></a>
<a href="https://www.npmjs.com/package/vue-happy-bus/v/next"><img src="https://img.shields.io/npm/v/vue-happy-bus/next" alt="Version"></a>
<a href="https://www.npmjs.com/package/vue-happy-bus"><img src="https://img.shields.io/npm/l/vue-happy-bus.svg" alt="License"></a>
![欢迎PR](https://img.shields.io/badge/PRs-welcome-brightgreen.svg) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

### 注意

* 此版本基于 `vue3` 使用，如果您是 `vue2` 用户请查看[这个版本](https://github.com/tangdaohai/vue-happy-bus/tree/master)
* 当前版本基于  vue3 和 [happy-event-bus](https://github.com/tangdaohai/happy-event-bus) 运行，如果您是 React/Angular/原生JS 用户可以直接使用 [happy-event-bus](https://github.com/tangdaohai/happy-event-bus)

### vue-happy-bus 是干嘛的

> 在 vue3 版本中删除了 `$on/$once/$off` API ([see](https://v3.vuejs.org/guide/migration/events-api.html#_3-x-update))，不过不用担心，可以使用此仓库作为替代方案，继续使用 event bus 的方式来实现跨组件的通信功能，并且不用手动去 $off 事件回调。

`vue-happy-bus`是一款基于vue3实现的`订阅/发布`插件。

在 vue 中，我们可以使用 event bus 来实现 `跨组件间通信`。但一个弊端就是，这种方式并不会自动销毁，所以为了避免回调函数重复执行，还要在 `onUnmounted` 中去移除回调函数。

这样带来的冗余代码就是:

1. $on 的回调函数必须是具名函数。不能简单的 `$on('event name', () => {})` 使用匿名函数作为回调，因为这样无法销毁事件监听，所以一般采用 `具名函数` 作为回调
2. 在`onUnmounted`生命周期中去销毁事件的监听。

我只是想在某个路由中监听下 header 中一个按钮的点击事件而已，竟然要这么麻烦？？？

所以此轮子被造出来了 🤘。

它主要解决在`夸组件间通信时`，避免重复绑定事件、无法自动销毁的而导致`回调函数被执行多次`的问题。

**总得来说他是能让你`偷懒`少写代码的工具。**

### 安装

1. npm/yarn

  ```shell
npm i vue-happy-bus@next
# or
yarn add vue-happy-bus@next
  ```

2. CDN

  ```html
<html>
  <script src="https://unpkg.com/vue-happy-bus@next/dist/index.umd.js"></script>
  <script>
    // global VueHappyBus
    const { $on, $once, $off, $emit } = VueHappyBus
  </script>
</html>
  ```

### 如何使用

自动注销监听事件的方式：

```typescript
// foo.vue
import { $on } from 'vue-happy-bus'
export default {
  setup () {
    // 在 foo.vue unmounted 后，会自动销毁 foo.vue 中的事件回调
    $on('event name', (...args) => {
      // do something
    })
  }
}

// bar.vue
import { $emit } from 'vue-happy-bus'
export default {
  setup () {
    // 触发 foo.vue 中的 event name 事件 
    $emit('event name', 'bar1', 'bar2')
  }
}
```

`$on/$once` 会返回一个取消监听函数，用来停止触发回调：

```typescript
import { $on } from 'vue-happy-bus'
export default {
  setup () {
    const stop = $on('foo', (...args) => {
      // 停止监听 foo 事件
      stop()
    })
  }
}
```



### API 

##### $on(eventName, callback)

监听一个事件，可以由 `$emit` 触发，回调函数会接收所有传入事件触发函数的额外参数。

 * 参数

   * `{string | number | symbol}` eventName
   * `{Function}` callback

* 返回

  * `{Function}` ListenStopHandle

* 示例

  ```typescript
  // string
  $on('foo', (msg) => {
    console.log(msg)
  })
  $emit('foo', 'hi') // => hi
  
  // symbol
  export const symbolFoo = Symbol('foo')
  $on(symbolFoo, (msg) => {
    console.log(msg)
  })
  $emit(symbolFoo, 'hi') // => hi
  
  // number
  export const FOO = 1
  $on(FOO, (msg) => {
    console.log(msg)
  })
  $emit(FOO, 'hi') // => hi
  
  // return
  const stop = $on('foo', () => {})
  // 主动取消监听
  stop()
  ```

##### $once(eventName, callback)

监听一个自定义事件，但是只触发一次。一旦触发之后，监听器就会被移除。

 * 参数

   * `{string | number | symbol}` 事件名称
   * `{Function}` callback

* 返回

  * `{Function}` ListenStopHandle

* 示例

  ```typescript
  // 使用方式与 $on 一致
  $once('foo', (msg) => {
    console.log(msg)
  })
  $emit('foo', 'hi') // => hi
  // emit again
  $emit('foo') // foo 回调不会执行，已经在 event bus 移除了
  ```

##### $off(eventName, callback)

> 如果只是移除一个回调函数的监听，建议使用 `$on` 的返回值来取消。

* 说明

  移除自定义事件监听。

  - 如果没有提供参数，则移除所有的事件监听；
  - 如果只提供了事件，则移除该事件所有的监听；
  - 如果同时提供了事件与回调，则只移除这个回调的监听。

* 参数

  * `{string | number | symbol | undefined}` 事件名称
  * `{Function}` callback

##### $emit(eventName, [...args])

触发指定的事件。附加参数都会传给事件监听器的回调。

* 参数

  * `{string | number | symbol}` eventName
  * `[...args: Array<any>]` 

* 示例

  ```typescript
  $on('foo', (...args) => console.log(args))
  
  $emit('foo', 'hi') // => ['hi']
  $emit('foo', 'hi', 'vue3') // => ['hi', 'vue3']
  ```

### 升级

确保已完成了 vue2 升级到 vue3 的工作。

1. 更新或者重新安装 `vue-happy-bus@next`

2. 因为导出方式的改变，需要手动修改引入方式。如果涉及多处修改，可使用下面的方式进行兼容：

   * 保存下面的代码为 `src/bus.ts`

     ```typescript
     import { $on, $once, $off, $emit } from 'vue-happy-bus'
     export const Bus = { $on, $once, $off, $emit }
     const BusFactory = () => Bus
     BusFactory.$emit = $emit
     BusFactory.$once = $once
     export default BusFactory
     ```

   * 借助编辑器的全局搜索替换功能，替换以下代码

     ```js
     import BusFactory, { Bus } from 'vue-happy-bus'
     // 将 vue-happy-bus 替换为 @/bus (@ 为 src 目录)
     import BusFactory, { Bus } from '@/bus'
     ```

### PR
期待并欢迎您的PR。
但请您一定要遵守 [standard ](https://github.com/standard/standard)代码风格规范。

### License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2017-present, tangdaohai
