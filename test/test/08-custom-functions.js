import {it, describe} from 'node:test'
import assert from 'node:assert'
import {ZzzBase, useFn, useLocal} from 'zzz-template'

describe('useFn - Custom Functions', () => {
  describe('register custom function with useFn', () => {
    const renderer = new ZzzBase()

    function greet(name) {
      return `Hello, ${name}!`
    }

    useFn(renderer, greet, 'GREET')

    it('should register and use custom function', () => {
      const fn = renderer.compile('${GREET("World")}')
      const result = fn({})
      assert.strictEqual(result, 'Hello, World!')
    })

    it('should access function via this.$', () => {
      assert.strictEqual(typeof renderer.$.greet, 'function')
      assert.strictEqual(renderer.$.greet('Test'), 'Hello, Test!')
    })
  })

  describe('custom function with alias', () => {
    const renderer = new ZzzBase()

    function uppercase(str) {
      return str.toUpperCase()
    }

    useFn(renderer, uppercase, 'UP')

    it('should use custom alias', () => {
      const fn = renderer.compile('${UP("hello")}')
      const result = fn({})
      assert.strictEqual(result, 'HELLO')
    })

    it('should use with data', () => {
      const fn = renderer.compile('${UP(data.text)}')
      const result = fn({text: 'world'})
      assert.strictEqual(result, 'WORLD')
    })
  })

  describe('custom function without alias', () => {
    const renderer = new ZzzBase()

    function reverse(str) {
      return str.split('').reverse().join('')
    }

    useFn(renderer, reverse)

    it('should register function without alias', () => {
      assert.strictEqual(typeof renderer.$.reverse, 'function')
      assert.strictEqual(renderer.$.reverse('hello'), 'olleh')
    })

    it('should not create alias in template context', () => {
      const fn = renderer.compile('${this.reverse("test")}')
      const result = fn({})
      assert.strictEqual(result, 'tset')
    })
  })

  describe('multiple custom functions', () => {
    const renderer = new ZzzBase()

    function add(a, b) {
      return a + b
    }

    function multiply(a, b) {
      return a * b
    }

    function subtract(a, b) {
      return a - b
    }

    useFn(renderer, add, 'ADD')
    useFn(renderer, multiply, 'MUL')
    useFn(renderer, subtract, 'SUB')

    it('should register multiple functions', () => {
      const fn = renderer.compile('${ADD(2, 3)} ${MUL(4, 5)} ${SUB(10, 3)}')
      const result = fn({})
      assert.strictEqual(result, '5 20 7')
    })

    it('should use functions together', () => {
      const fn = renderer.compile('${MUL(ADD(2, 3), SUB(10, 5))}')
      const result = fn({})
      assert.strictEqual(result, '25')
    })
  })

  describe('custom function accessing this.local', () => {
    const renderer = new ZzzBase()
    useLocal(renderer)

    function getLocal(key) {
      return this.local[key] || 'not found'
    }

    useFn(renderer, getLocal, 'GET')

    it('should access local variables from custom function', () => {
      const fn = renderer.compile('${SET("myVar", "myValue")}${GET("myVar")}', {})
      const result = fn({})
      assert.strictEqual(result, 'myValue')
    })

    it('should return default when key not found', () => {
      const fn = renderer.compile('${GET("missing")}', {})
      const result = fn({})
      assert.strictEqual(result, 'not found')
    })
  })

  describe('custom function with complex logic', () => {
    const renderer = new ZzzBase()

    function formatPrice(price, currency = 'USD') {
      const symbols = {USD: '$', EUR: '€', GBP: '£'}
      const symbol = symbols[currency] || currency
      return `${symbol}${price.toFixed(2)}`
    }

    useFn(renderer, formatPrice, 'PRICE')

    it('should use default parameter', () => {
      const fn = renderer.compile('${PRICE(19.99)}')
      const result = fn({})
      assert.strictEqual(result, '$19.99')
    })

    it('should use custom currency', () => {
      const fn = renderer.compile('${PRICE(29.99, "EUR")}')
      const result = fn({})
      assert.strictEqual(result, '€29.99')
    })

    it('should work with data', () => {
      const fn = renderer.compile('${PRICE(data.price, data.currency)}')
      const result = fn({price: 99.5, currency: 'GBP'})
      assert.strictEqual(result, '£99.50')
    })
  })

  describe('custom function returning objects/arrays', () => {
    const renderer = new ZzzBase()

    function createUser(name, age) {
      return {name, age}
    }

    function createArray(...items) {
      return items
    }

    useFn(renderer, createUser, 'USER')
    useFn(renderer, createArray, 'ARR')

    it('should return object', () => {
      const fn = renderer.compile('${JSON.stringify(USER("Alice", 30))}')
      const result = fn({})
      assert.strictEqual(result, '{"name":"Alice","age":30}')
    })

    it('should return array', () => {
      const fn = renderer.compile('${JSON.stringify(ARR(1, 2, 3))}')
      const result = fn({})
      assert.strictEqual(result, '[1,2,3]')
    })

    it('should access object properties', () => {
      const fn = renderer.compile('${USER("Bob", 25).name}')
      const result = fn({})
      assert.strictEqual(result, 'Bob')
    })
  })

  describe('custom function with arrow function', () => {
    const renderer = new ZzzBase()

    const double = (n) => n * 2
    const triple = (n) => n * 3

    useFn(renderer, double, 'DOUBLE')
    useFn(renderer, triple, 'TRIPLE')

    it('should work with arrow functions', () => {
      const fn = renderer.compile('${DOUBLE(5)} ${TRIPLE(5)}')
      const result = fn({})
      assert.strictEqual(result, '10 15')
    })
  })

  describe('custom function modifying renderer state', () => {
    const renderer = new ZzzBase()
    useLocal(renderer)

    function saveToLocal(key, value) {
      this.local[key] = value
      return ''
    }

    useFn(renderer, saveToLocal, 'SAVE')

    it('should modify local state from custom function', () => {
      const fn = renderer.compile('${SAVE("x", 42)}Value: ${local.x}', {})
      const result = fn({})
      assert.strictEqual(result, 'Value: 42')
    })
  })

  describe('custom function with variable arguments', () => {
    const renderer = new ZzzBase()

    function sum(...numbers) {
      return numbers.reduce((a, b) => a + b, 0)
    }

    function join(separator, ...strings) {
      return strings.join(separator)
    }

    useFn(renderer, sum, 'SUM')
    useFn(renderer, join, 'JOIN')

    it('should handle variable number of arguments', () => {
      const fn = renderer.compile('${SUM(1, 2, 3, 4, 5)}')
      const result = fn({})
      assert.strictEqual(result, '15')
    })

    it('should handle rest parameters with first param', () => {
      const fn = renderer.compile('${JOIN("-", "a", "b", "c")}')
      const result = fn({})
      assert.strictEqual(result, 'a-b-c')
    })
  })

  describe('escapeHtml custom function (from README)', () => {
    const renderer = new ZzzBase()

    function escapeHtml(unsafe) {
      return unsafe
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;")
    }

    useFn(renderer, escapeHtml, 'ESCAPE')

    it('should escape HTML characters', () => {
      const fn = renderer.compile('${ESCAPE(data.text)}')
      const result = fn({text: '<script>alert("XSS")</script>'})
      assert.strictEqual(result, '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;')
    })

    it('should escape all special characters', () => {
      const fn = renderer.compile('${ESCAPE("<>&\\"\'")}')
      const result = fn({})
      assert.strictEqual(result, '&lt;&gt;&amp;&quot;&#039;')
    })
  })

  describe('custom function overriding built-in', () => {
    const renderer = new ZzzBase()

    function customTemplate(str, data) {
      return `CUSTOM: ${str}`
    }

    useFn(renderer, customTemplate, 'TEMPLATE')

    it('should allow overriding with custom implementation', () => {
      const fn = renderer.compile('${TEMPLATE("test", {})}')
      const result = fn({})
      assert.strictEqual(result, 'CUSTOM: test')
    })
  })

  describe('custom function with context binding', () => {
    const renderer = new ZzzBase()

    renderer.$.config = {prefix: 'PREFIX'}

    function useConfig(text) {
      return `${this.config.prefix}: ${text}`
    }

    useFn(renderer, useConfig, 'CONFIG')

    it('should access renderer $ properties', () => {
      const fn = renderer.compile('${CONFIG("test")}')
      const result = fn({})
      assert.strictEqual(result, 'PREFIX: test')
    })
  })
})
