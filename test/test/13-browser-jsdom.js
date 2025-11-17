import {it, describe} from 'node:test'
import assert from 'node:assert'
import {JSDOM} from 'jsdom'
import {ZzzBrowser, useContentTrim, useInclude, useIfMap} from 'zzz-template'

describe('ZzzBrowser with JSDOM', () => {
  // Helper to setup and cleanup JSDOM environment
  function withDOM(testFn) {
    return () => {
      const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
      global.window = dom.window
      global.document = dom.window.document

      // Polyfill innerText for JSDOM (JSDOM only supports textContent)
      Object.defineProperty(dom.window.HTMLElement.prototype, 'innerText', {
        get() {
          return this.textContent
        },
        set(value) {
          this.textContent = value
        }
      })

      try {
        return testFn()
      } finally {
        delete global.window
        delete global.document
      }
    }
  }

  describe('basic ZzzBrowser functionality', () => {
    it('should read template from DOM element by id', withDOM(() => {
      document.body.innerHTML = '<script id="tpl" type="text/plain">Hello ${data.name}!</script>'

      const renderer = new ZzzBrowser()
      const result = renderer.render('tpl', {name: 'World'})

      assert.strictEqual(result, 'Hello World!')
    }))

    it('should read from div element', withDOM(() => {
      const elem = document.createElement('div')
      elem.id = 'test'
      elem.innerText = 'Value: ${data.val}'
      document.body.appendChild(elem)

      const zzz = new ZzzBrowser()
      const result = zzz.render('test', {val: 42})

      assert.strictEqual(result, 'Value: 42')
    }))

    it('should read from span element', withDOM(() => {
      document.body.innerHTML = '<span id="msg">Message: ${data.text}</span>'

      const zzz = new ZzzBrowser()
      const result = zzz.render('msg', {text: 'hello'})

      assert.strictEqual(result, 'Message: hello')
    }))
  })

  describe('multiple templates', () => {
    it('should read multiple templates from same document', withDOM(() => {
      document.body.innerHTML = `
        <script id="header" type="text/plain"><h1>\${data.title}</h1></script>
        <script id="footer" type="text/plain"><footer>\${data.year}</footer></script>
      `

      const zzz = new ZzzBrowser()

      assert.strictEqual(zzz.render('header', {title: 'Test'}), '<h1>Test</h1>')
      assert.strictEqual(zzz.render('footer', {year: 2025}), '<footer>2025</footer>')
    }))

    it('should handle rendering same template multiple times', withDOM(() => {
      document.body.innerHTML = '<div id="tpl">Count: ${data.n}</div>'

      const zzz = new ZzzBrowser()

      assert.strictEqual(zzz.render('tpl', {n: 1}), 'Count: 1')
      assert.strictEqual(zzz.render('tpl', {n: 2}), 'Count: 2')
      assert.strictEqual(zzz.render('tpl', {n: 3}), 'Count: 3')
    }))
  })

  describe('with plugins', () => {
    it('should work with useContentTrim', withDOM(() => {
      document.body.innerHTML = '<script id="tpl" type="text/plain">  Hello ${data.name}!  </script>'

      const zzz = new ZzzBrowser()
      useContentTrim(zzz)
      const result = zzz.render('tpl', {name: 'World'})

      assert.strictEqual(result, 'Hello World!')
    }))

    it('should work with useInclude', withDOM(() => {
      document.body.innerHTML = `
        <script id="main" type="text/plain">\${INCLUDE("partial", data)}</script>
        <script id="partial" type="text/plain">Name: \${data.name}</script>
      `

      const zzz = new ZzzBrowser()
      useInclude(zzz)
      const result = zzz.render('main', {name: 'Alice'})

      assert.strictEqual(result, 'Name: Alice')
    }))

    it('should work with useIfMap IF function', withDOM(() => {
      document.body.innerHTML = `
        <script id="conditional" type="text/plain">\${IF(data.show, "visible", data)}</script>
      `

      const zzz = new ZzzBrowser()
      useIfMap(zzz)

      assert.strictEqual(zzz.render('conditional', {show: true}), 'visible')
      assert.strictEqual(zzz.render('conditional', {show: false}), '')
    }))

    it('should work with useIfMap MAP function', withDOM(() => {
      document.body.innerHTML = '<script id="list" type="text/plain">${MAP(data.items, "<li>\\${data}</li>")}</script>'

      const zzz = new ZzzBrowser()
      useIfMap(zzz)
      const result = zzz.render('list', {items: [1, 2, 3]})

      assert.strictEqual(result, '<li>1</li><li>2</li><li>3</li>')
    }))
  })

  describe('error handling', () => {
    it('should throw TypeError when element not found', withDOM(() => {
      const zzz = new ZzzBrowser()

      assert.throws(() => {
        zzz.render('nonexistent', {})
      }, TypeError)
    }))

    it('should handle element with empty content', withDOM(() => {
      document.body.innerHTML = '<div id="empty"></div>'

      const zzz = new ZzzBrowser()
      const result = zzz.render('empty', {})

      assert.strictEqual(result, '')
    }))
  })

  describe('data types', () => {
    it('should handle string data', withDOM(() => {
      document.body.innerHTML = '<div id="str">Value: ${data}</div>'

      const zzz = new ZzzBrowser()
      const result = zzz.render('str', 'test')

      assert.strictEqual(result, 'Value: test')
    }))

    it('should handle number data', withDOM(() => {
      document.body.innerHTML = '<div id="num">Number: ${data}</div>'

      const zzz = new ZzzBrowser()
      const result = zzz.render('num', 42)

      assert.strictEqual(result, 'Number: 42')
    }))

    it('should handle boolean data', withDOM(() => {
      document.body.innerHTML = '<div id="bool">Bool: ${data}</div>'

      const zzz = new ZzzBrowser()
      const result = zzz.render('bool', true)

      assert.strictEqual(result, 'Bool: true')
    }))

    it('should handle object data', withDOM(() => {
      document.body.innerHTML = '<div id="obj">${data.a} - ${data.b}</div>'

      const zzz = new ZzzBrowser()
      const result = zzz.render('obj', {a: 1, b: 2})

      assert.strictEqual(result, '1 - 2')
    }))

    it('should handle array data with join', withDOM(() => {
      document.body.innerHTML = '<div id="arr">${data.join(", ")}</div>'

      const zzz = new ZzzBrowser()
      const result = zzz.render('arr', ['A', 'B', 'C'])

      assert.strictEqual(result, 'A, B, C')
    }))
  })

  describe('complex scenarios', () => {
    it('should handle nested templates with includes', withDOM(() => {
      document.body.innerHTML = `
        <script id="page" type="text/plain">\${INCLUDE("header", {title: data.title})}<main>\${data.content}</main></script>
        <script id="header" type="text/plain"><h1>\${data.title}</h1></script>
      `

      const zzz = new ZzzBrowser()
      useInclude(zzz)
      const result = zzz.render('page', {title: 'Hello', content: 'World'})

      assert.ok(result.includes('<h1>Hello</h1>'))
      assert.ok(result.includes('<main>World</main>'))
    }))

    it('should handle conditional rendering with complex data', withDOM(() => {
      document.body.innerHTML = '<script id="user" type="text/plain">${IF(data.active, "User: \\${data.name}", data)}</script>'

      const zzz = new ZzzBrowser()
      useIfMap(zzz)

      const result1 = zzz.render('user', {name: 'Alice', active: true})
      assert.strictEqual(result1, 'User: Alice')

      const result2 = zzz.render('user', {name: 'Bob', active: false})
      assert.strictEqual(result2, '')
    }))

    it('should handle mapping over objects', withDOM(() => {
      document.body.innerHTML = '<script id="cards" type="text/plain">${MAP(data.users, "<div>\\${data.name}: \\${data.age}</div>")}</script>'

      const zzz = new ZzzBrowser()
      useIfMap(zzz)
      const result = zzz.render('cards', {
        users: [
          {name: 'Alice', age: 30},
          {name: 'Bob', age: 25}
        ]
      })

      assert.ok(result.includes('<div>Alice: 30</div>'))
      assert.ok(result.includes('<div>Bob: 25</div>'))
    }))
  })

  describe('compile method with browser', () => {
    it('should use compile directly', withDOM(() => {
      document.body.innerHTML = '<div id="tpl">Compiled: ${data.val}</div>'

      const zzz = new ZzzBrowser()
      const template = zzz.read('tpl')
      const fn = zzz.compile(template)
      const result = fn({val: 'test'})

      assert.strictEqual(result, 'Compiled: test')
    }))

    it('should reuse compiled function', withDOM(() => {
      document.body.innerHTML = '<div id="tpl">${data.x} + ${data.y}</div>'

      const zzz = new ZzzBrowser()
      const fn = zzz.compile(zzz.read('tpl'))

      assert.strictEqual(fn({x: 1, y: 2}), '1 + 2')
      assert.strictEqual(fn({x: 3, y: 4}), '3 + 4')
      assert.strictEqual(fn({x: 5, y: 6}), '5 + 6')
    }))
  })

  describe('special characters in DOM', () => {
    it('should handle quotes in template', withDOM(() => {
      document.body.innerHTML = '<div id="quotes">He said "${data.msg}"</div>'

      const zzz = new ZzzBrowser()
      const result = zzz.render('quotes', {msg: 'hello'})

      assert.strictEqual(result, 'He said "hello"')
    }))

    it('should handle unicode in template', withDOM(() => {
      document.body.innerHTML = '<div id="unicode">Unicode: ${data.emoji} 中文</div>'

      const zzz = new ZzzBrowser()
      const result = zzz.render('unicode', {emoji: '🎉'})

      assert.strictEqual(result, 'Unicode: 🎉 中文')
    }))

    it('should handle newlines in template', withDOM(() => {
      const elem = document.createElement('pre')
      elem.id = 'multiline'
      elem.innerText = 'Line 1\n${data.text}\nLine 3'
      document.body.appendChild(elem)

      const zzz = new ZzzBrowser()
      const result = zzz.render('multiline', {text: 'Line 2'})

      assert.ok(result.includes('Line 1'))
      assert.ok(result.includes('Line 2'))
      assert.ok(result.includes('Line 3'))
    }))
  })
})
