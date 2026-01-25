import {it, describe} from 'node:test'
import assert from 'node:assert'

import {ZzzTemplateBase, useLayout, useLocal, useContentTrim, ZzzTemplateNode} from 'zzz-template/node.js'

describe('compile', () => {
  describe('basic', () => {
    const renderer = new ZzzTemplateBase
    const tpl = "Hello ${data.name}!"
    const fn = renderer.compile(tpl)
    assert.strictEqual(typeof fn, 'function')

    it('hello world', () => {
      const result = fn({name: 'world'})
      assert.strictEqual(result, 'Hello world!')
    })

    it('hello 42', () => {
      const result = fn({name: 42})
      assert.strictEqual(result, 'Hello 42!')
    })

    it('hello true', () => {
      const result = fn({name: true})
      assert.strictEqual(result, 'Hello true!')
    })

    it('hello false', () => {
      const result = fn({name: false})
      assert.strictEqual(result, 'Hello false!')
    })

    it('hello undefined', () => {
      const result = fn({})
      assert.strictEqual(result, 'Hello undefined!')
    })

    it('hello null', () => {
      const result = fn({name: null})
      assert.strictEqual(result, 'Hello null!')
    })

    it('hello 1,2,3', () => {
      const result = fn({name: [1, 2, 3]})
      assert.strictEqual(result, 'Hello 1,2,3!')
    })
  })

  describe('trim', () => {
    const renderer = new ZzzTemplateBase()
    useContentTrim(renderer)

    const tpl = " Hello ${data.name}! "
    const fn = renderer.compile(tpl)
    assert.strictEqual(typeof fn, 'function')

    it('hello world', () => {
      const result = fn({name: 'world'})
      assert.strictEqual(result, 'Hello world!')
    })
  })
})

describe('render, default read', () => {
  const renderer = new ZzzTemplateNode({dir: import.meta.dirname})
  useContentTrim(renderer)
  useLayout(renderer)

  describe('render trim', () => {
    it('Hello world!', () => {
      assert.strictEqual(
        renderer.render('hello.html', {name: 'world'}),
        'Hello world!'
      )
    })

    it('Hello world! /w layout', () => {
      assert.strictEqual(
        renderer.render('message.html', {name: 'world'}),
        '<layout>Hello world!</layout>'
      )
    })
  })
})

describe('render, custom read fs (test/dir)', () => {
  const renderer = new ZzzTemplateNode({dir: `${import.meta.dirname}/templates`})
  useLocal(renderer)
  useContentTrim(renderer)
  useLayout(renderer)

  describe('render trim', () => {
    it('Hello world!', () => {
      const result = renderer.render('hello.html', {name: 'world'})
      assert.strictEqual(
        result,
        'Hello world!'
      )
    })

    it('Hello world! /w layout', () => {
      const result = renderer.render('message.html', {name: 'world'}, {foo: 'FOO'})
      assert.strictEqual(
        result,
        '<p>FOO</p>\n<section class="dir">Hello Universe! Hello world!</section>\n<p>baz</p>\n<p>fromValue</p>'
      )
    })
  })
})

describe('render, custom read (mem)', () => {
  const templates = {
    'hello.html': ' Hello ${data.name}! \n',
    'message.html': '${LAYOUT("layout.html")}\n Hello ${data.name}! \n',
    'layout.html': ' <layout>${data.content}</layout> ',
  }

  const renderer = new ZzzTemplateBase()
  useContentTrim(renderer)
  useLayout(renderer)
  renderer.read = (f) => {return templates[f]}

  describe('render trim', () => {
    it('Hello world!', () => {
      assert.strictEqual(
        renderer.render('hello.html', {name: 'world'}),
        'Hello world!'
      )
    })

    it('Hello world! /w layout', () => {
      assert.strictEqual(
        renderer.render('message.html', {name: 'world'}),
        '<layout>Hello world!</layout>'
      )
    })
  })
})


describe('useLocal shallow copy', () => {
  const templates = {
    'hello': '${SET("foo", 42)}${SETA("bar", "BAR")}${SETA("qux", 123)}\nHello ${data.name}!',
    'message': '${LAYOUT("layout")}\n Message ${data.name}! \n',
    'layout': ' <layout>${data.content}</layout> ',
  }

  const renderer = new ZzzTemplateBase()
  useLocal(renderer)
  useContentTrim(renderer)
  renderer.read = (f) => {return templates[f]}

  const local = {foo: "FOO", qux: [1]};

  let result = renderer.render('hello', {name: 'world'}, local)

  it ('should be rendered', () => {
    assert.strictEqual(result,'Hello world!')
  })

  it('should foo is "FOO"', () => {
    assert.strictEqual(local.foo, 'FOO')
  })

  it('should bar is undefined', () => {
    assert.deepEqual(local.bar, undefined)
  })

  it('should qux unchanged and === [1]', () => {
    assert.deepEqual(local.qux, [1])
  })

  // result = renderer.render('hello', {name: 'world'}, local)

  it('should foo be "FOO"', () => {
    assert.strictEqual(local.foo, 'FOO')
  })

  // it('Hello world! /w layout', () => {
  //   assert.strictEqual(
  //     renderer.render('message.html', {name: 'world'}, {}),
  //     '<layout>Hello world!</layout>'
  //   )
  // })

})

describe('useLocal', () => {
  const renderer = new ZzzTemplateBase()
  useLocal(renderer)

  describe('set', () => {
    renderer.$.SET('k0', () => {});
    renderer.$.SET('k1', null);
    renderer.$.SET('k2', undefined);
    renderer.$.SET('k3', 'string');
    renderer.$.SET('k4', 42);
    renderer.$.SET('k5', true);
    renderer.$.SET('k6', false);
    renderer.$.SET('k0', 'aaa');

    it('should k0 is "aaa"', () => {
      assert.strictEqual(renderer.$.local.k0, 'aaa')
    })
    it('should k1 is null', () => {
      assert.strictEqual(renderer.$.local.k1, null)
    })
    it('should k2 is undefined', () => {
      assert.strictEqual(renderer.$.local.k2, undefined)
    })
    it('should k3 is string', () => {
      assert.strictEqual(renderer.$.local.k3, 'string')
    })
    it('should k4 is number', () => {
      assert.strictEqual(renderer.$.local.k4, 42)
    })
    it('should k5 is true', () => {
      assert.strictEqual(renderer.$.local.k5, true)
    })
    it('should k6 is false', () => {
      assert.strictEqual(renderer.$.local.k6, false)
    })
  })

  describe('seta (various values)', () => {
    renderer.$.SETA('a1', null);
    renderer.$.SETA('a1', undefined);

    it('should a1 is [null, undefined]', () => {
      assert.deepEqual(renderer.$.local.a1, [null, undefined])
    })

    renderer.$.SETA('a2', 0, [1, 2, 3], 4, 5, 'six');
    renderer.$.SETA('a2', [true, false]);
    renderer.$.SETA('a2', 'abc');
    renderer.$.SETA('a2', 42);

    it('should a2 is array', () => {
      assert.deepEqual(renderer.$.local.a2, [0, 1, 2, 3, 4, 5, 'six', true, false, 'abc', 42])
    })
  })

  describe('set and seta (works together)', () => {
    renderer.$.SET('o1', 'aaa');
    renderer.$.SETA('o1', ['bbb']);

    it('should o1 is ["aaa", "bbb"]', () => {
      assert.deepEqual(renderer.$.local.o1, ["aaa", "bbb"])
    })

    renderer.$.SET('o2', ['aaa']);
    renderer.$.SETA('o2', ['bbb']);
    it('should o2 is ["aaa", "bbb"]', () => {
      assert.deepEqual(renderer.$.local.o2, ["aaa", "bbb"])
    })

    renderer.$.SETA('o3', ['bbb']);
    renderer.$.SET('o3', 'aaa');
    it('should o3 is "aaa"', () => {
      assert.deepEqual(renderer.$.local.o3, "aaa")
    })
  })
})
