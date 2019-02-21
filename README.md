vue-happy-bus
===


<a href="https://www.npmjs.com/package/vue-happy-bus"><img src="https://img.shields.io/npm/dm/vue-happy-bus.svg" alt="Downloads"></a>
<a href="https://www.npmjs.com/package/vue-happy-bus"><img src="https://img.shields.io/npm/v/vue-happy-bus.svg" alt="Version"></a>
<a href="https://www.npmjs.com/package/vue-happy-bus"><img src="https://img.shields.io/github/issues-raw/tangdaohai/vue-happy-bus.svg" alt="open issues"></a>
<a href="https://www.npmjs.com/package/vue-happy-bus"><img src="https://img.shields.io/github/issues-closed-raw/tangdaohai/vue-happy-bus.svg" alt="closed issues"></a>
<a href="https://www.npmjs.com/package/vue-happy-bus"><img src="https://img.shields.io/npm/l/vue-happy-bus.svg" alt="License"></a>
![欢迎PR](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

### vue-happy-bus 是干嘛的

`vue-happy-bus`是一款基于vue实现的`订阅/发布`插件。

我们通常在使用`非父子组件`间通信时，采用`new Bus()`的方式来做一个`事件广播`。
但一个弊端就是，这种方式并不会自动销毁，所以为了避免回调函数重复执行，还要在`destroyed`周期中去做`Bus.$off('event name', fn)`的操作。

这样带来的冗余代码就是:

1. $on 的回调函数必须是具名函数。不能简单的`Bus.$on('event name', () => {})`使用匿名函数作为回调了，所以需要将回调函数放到`metheds`中进行`额外的声明`
2. 在`destroyed`生命周期中去销毁事件的监听。

我只是想在某个路由中监听下 header 中一个按钮的点击事件而已，竟然要这么麻烦？？？

所以此轮子被造出来了 🤘。

它主要解决在`非父子组件`间通信时，解决重复绑定事件、无法自动销毁的而导致`回调函数被执行多次`的问题。

**总得来说他是能让你`偷懒`少写代码的工具。**

### 安装

1. npm
  推荐使用`npm`，这样可以跟随你的`webpack`配置去选择怎样打包。

  ```
  npm i -D vue-happy-bus
  ```

2. CDN

  ```html
    <html>
      <script src="https://unpkg.com/vue-happy-bus/dist/happy-bus.min.js"></script>
    </html>
  ```

### 如何使用

自动注销监听事件的方式：

```js
import BusFactory from 'vue-happy-bus'
export default {
  data () {
    return {
      bus: BusFactory(this) // 使用BusFactory将this绑定之后，返回一个 bus，即可无需关心销毁的问题了
    }
  },
  created () {
    // 在生命周期中进行 $on
    this.bus.$on('event name', () => {
      // do  something
    })

    // 当使用 $once 与 $emit 可直接在BusFactory使用
    BusFactory.$once('event name', () => {
      // do  something
    })
    BusFactory.$emit('event name', '参数')
  }
}
```

或者你也可以只引入 `new Vue()` 后的 `Bus`。
它不会像 BusFactory 那样自动注销 `$on` 的事件。

> 因为当你在某些插件中想要使用 `bus` 的时候，这些插件并不是 vue 组件，所以没有 this, 也没有 destroyed 函数。

```js
import { Bus } from 'vue-happy-bus'

// ...
Bus.$on('type', 'handler')

// 在适当的时候，需要手动注销
Bus.$off('type', 'handler')

```

如果你只需要 `$emit` 也可以只引用 `Bus`

```js
import { Bus } from 'vue-happy-bus'

Bus.$emit('type') // Bus.$emit 也会通知到通过 BusFactory.$on 的函数
```

### 属性

bus 只包含4个方法：

* $on
* $off
* $emit
* $once

它们是基于`new Vue()`后衍生出来的，与`Vue`的使用方式一模一样。

### PR
期待并欢迎您的PR。
但请您一定要遵守[standard](https://github.com/standard/standard)代码风格规范。
并且您只需要提交`src`目录下的源码即可，`无需`提交`build`之后的代码

### License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2017-present, tangdaohai
