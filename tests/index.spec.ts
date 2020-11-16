import { defineComponent, ref, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { $on, $once, $emit, $off } from '../src/index'

describe('vue-happy-bus:', () => {
  it('$on/$once and $emit:', async () => {
    expect.hasAssertions()
    const onceFn = jest.fn()
    const component = defineComponent({
      template: '<div>{{foo}}</div>',
      setup () {
        const foo = ref('foo')

        $on('foo', (...args: Array<string>) => (foo.value = args.join('')))
        $once('bar', onceFn)

        return {
          foo
        }
      }
    })

    const wrapper = mount(component)
    expect(wrapper.find('div').text()).toBe('foo')

    // emit, change foo value
    $emit('foo', 'foo1', 'foo2')
    await nextTick()
    expect(wrapper.find('div').text()).toBe('foo1foo2')

    // emit bar
    $emit('bar')
    expect(onceFn).toHaveBeenCalledTimes(1)
    // emit bar again
    $emit('bar')
    expect(onceFn).toHaveBeenCalledTimes(1)

    // $on return a function, run it will off himself
    // wrapper.vm.stopHandle()
    // $emit('foo', 'foo')
    // // foo value is bar, because foo event canceled
    // expect(wrapper.vm.foo).toBe('bar')
  })

  it('$off:', () => {
    expect.hasAssertions()
    const fooFn = jest.fn()
    const barFn = jest.fn()
    const foo2Fn = jest.fn()
    const bar2Fn = jest.fn()
    const bazFn = jest.fn()

    const component = defineComponent({
      template: '<div></div>',
      setup () {
        $on('foo', fooFn)
        const stopOnce = $once('bar', barFn)

        $on('foo', foo2Fn)

        $on('bar', bar2Fn)

        $once('baz', bazFn)

        return {
          stopOnce
        }
      }
    })
    const wrapper = mount(component)
    // off fooFn
    $off('foo', fooFn)
    $emit('foo')
    expect(fooFn).toHaveBeenCalledTimes(0)
    expect(foo2Fn).toHaveBeenCalledTimes(1)

    // off all foo
    $off('foo')
    $emit('foo')
    expect(fooFn).toHaveBeenCalledTimes(0)
    expect(foo2Fn).toHaveBeenCalledTimes(1)

    // off bar once
    wrapper.vm.stopOnce()
    $emit('bar')
    expect(barFn).toHaveBeenCalledTimes(0)
    expect(bar2Fn).toHaveBeenCalledTimes(1)

    // bar2Fn and bazFn not cancelled before off all events
    expect(bazFn).toHaveBeenCalledTimes(0)
    $off()
    $emit('bar')
    $emit('baz')
    expect(bar2Fn).toHaveBeenCalledTimes(1)
    expect(bazFn).toHaveBeenCalledTimes(0)
  })

  it('event type symbol/string/number:', () => {
    expect.hasAssertions()
    const symbolFoo = Symbol('foo')
    const symbolFn = jest.fn()
    const numberFn = jest.fn()
    const component = defineComponent({
      template: '<div></div>',
      setup () {
        $on(symbolFoo, symbolFn)
        $on(9999, numberFn)
      }
    })
    mount(component)

    $emit(symbolFoo)
    expect(symbolFn).toHaveBeenCalledTimes(1)

    $emit(9999)
    expect(numberFn).toHaveBeenCalledTimes(1)
  })

  it('quickly cancel listen:', () => {
    expect.hasAssertions()
    const fooFn = jest.fn()
    const barFn = jest.fn()
    const fooStop = $on('foo', fooFn)
    const barStop = $once('bar', barFn)

    $emit('foo')
    expect(fooFn).toHaveBeenCalledTimes(1)
    // cancel foo-fooFn
    fooStop()
    $emit('foo')
    expect(fooFn).toHaveBeenCalledTimes(1)

    // stop bar
    barStop()
    $emit('bar')
    expect(barFn).toHaveBeenCalledTimes(0)
  })

  it('vue3 Composition API auto cancel listen:', () => {
    expect.hasAssertions()
    const fn = jest.fn()
    const component = defineComponent({
      template: '<div></div>',
      setup () {
        $on('foo', fn)
      }
    })
    const wrapper = mount(component)
    expect(fn).toHaveBeenCalledTimes(0)

    $emit('foo')
    expect(fn).toHaveBeenCalledTimes(1)

    wrapper.unmount()
    $emit('foo')
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
