/*!
  name: vue-happy-bus
  version: 1.0.1
  author: tangdaohai@outlook.com
  github: https://github.com/tangdaohai/vue-happy-bus
  */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('vue')) :
	typeof define === 'function' && define.amd ? define(['exports', 'vue'], factory) :
	(factory((global['happy-bus'] = {}),global.Vue$));
}(this, (function (exports,Vue$) { 'use strict';

Vue$ = Vue$ && Vue$.hasOwnProperty('default') ? Vue$['default'] : Vue$;

var version = "1.0.1";

var Vue = Vue$;
if (typeof window !== 'undefined' && window.Vue) {
  Vue = window.Vue;
}

// 记录所有的事件类型与事件函数
var EventStore = {};
var Bus = new Vue();

// 移除所有事件的方法
var destroyHandler = function destroyHandler() {
  // this 为调用此方法的vue组件
  var currentEventObj = EventStore[this._uid];
  if (typeof currentEventObj === 'undefined') {
    return;
  }
  for (var type in currentEventObj) {
    var key = Array.isArray(type) ? type.join(',') : type;
    // Bus 解绑事件
    Bus.$off(type, currentEventObj[key]);
  }
  // 删除记录的事件集合
  delete EventStore[this._uid];
};

var BusFactory = function BusFactory(vm) {
  // 当前调用组件的 destroyed 钩子
  var destroyed = vm.$options.destroyed;
  // 当前组件的唯一标示(vue生成的自增ID)
  var uid = vm._uid;
  // 初始化当前组件的事件集合对象
  EventStore[uid] = {};
  // 为当前组件挂载destroyed钩子
  !destroyed.includes(destroyHandler) && destroyed.push(destroyHandler);

  return {
    $on: function $on(type, handler) {
      var key = Array.isArray(type) ? type.join(',') : type;
      EventStore[uid][key] = handler;
      Bus.$on(type, handler);
    },
    $off: function $off(type, handler) {
      // $off() 时 type 为空，移除所有事件
      if (!type) {
        // 删除该uid下事件集合
        delete EventStore[uid];
        Bus.$off();
        return;
      }
      var key = Array.isArray(type) ? type.join(',') : type;
      // 删除对应的事件
      delete EventStore[uid][key];
      Bus.$off(type, handler);
    },
    $once: function $once() {
      return Bus.$once.apply(Bus, arguments);
    },
    $emit: function $emit() {
      return Bus.$emit.apply(Bus, arguments);
    }
  };
};

BusFactory.$emit = function () {
  return Bus.$emit.apply(Bus, arguments);
};
BusFactory.$once = function () {
  return Bus.$once.apply(Bus, arguments);
};

exports['default'] = BusFactory;
exports.Bus = Bus;
exports.version = version;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=happy-bus.js.map
