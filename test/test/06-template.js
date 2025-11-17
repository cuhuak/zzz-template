import {it, describe} from 'node:test'
import assert from 'node:assert'
import {ZzzBase, useIfMap, useLocal} from 'zzz-template'

describe('TEMPLATE function', () => {
  describe('direct TEMPLATE usage', () => {
    const renderer = new ZzzBase()
    useIfMap(renderer)

    it('should render template string with data', () => {
      const fn = renderer.compile('${TEMPLATE("Hello ${data.name}", {name: "world"})}')
      const result = fn({})
      assert.strictEqual(result, 'Hello world')
    })

    it('should work with backtick template strings', () => {
      const fn = renderer.compile('${TEMPLATE(`Hello \\${data.name}`, {name: "world"})}')
      const result = fn({})
      assert.strictEqual(result, 'Hello world')
    })
  })

  describe('TEMPLATE with complex strings', () => {
    const renderer = new ZzzBase()
    useIfMap(renderer)

    it('should handle multiline templates', () => {
      const fn = renderer.compile('${TEMPLATE(`Line 1\\nLine 2\\nHello \\${data.name}`, {name: "world"})}')
      const result = fn({})
      assert.strictEqual(result, 'Line 1\nLine 2\nHello world')
    })

    it('should handle templates with special characters', () => {
      const fn = renderer.compile('${TEMPLATE("Name: ${data.name}, Age: ${data.age}", {name: "Alice", age: 30})}')
      const result = fn({})
      assert.strictEqual(result, 'Name: Alice, Age: 30')
    })

    it('should handle nested expressions', () => {
      const fn = renderer.compile('${TEMPLATE("Sum: ${data.a + data.b}", {a: 10, b: 20})}')
      const result = fn({})
      assert.strictEqual(result, 'Sum: 30')
    })
  })

  describe('TEMPLATE with local variables', () => {
    const renderer = new ZzzBase()
    useIfMap(renderer)
    useLocal(renderer)

    it('should access local variables', () => {
      const fn = renderer.compile('${SET("title", "Global")}${TEMPLATE("Title: ${local.title}", {})}', {})
      const result = fn({})
      assert.strictEqual(result, 'Title: Global')
    })

    it('should preserve local variables across TEMPLATE calls', () => {
      const fn = renderer.compile('${SET("x", 1)}${TEMPLATE("${local.x}", {})} ${SETA("x", 2)}${TEMPLATE("${local.x}", {})}', {})
      const result = fn({})
      assert.strictEqual(result, '1 1,2')
    })
  })

  describe('TEMPLATE with MAP', () => {
    const renderer = new ZzzBase()
    useIfMap(renderer)

    it('should work inside MAP', () => {
      const fn = renderer.compile('${MAP(data.items, "${TEMPLATE(\'<li>\\${data}</li>\', data)}")}')
      const result = fn({items: [1, 2, 3]})
      assert.strictEqual(result, '<li>1</li><li>2</li><li>3</li>')
    })

    it('should use MAP inside TEMPLATE', () => {
      const fn = renderer.compile('${TEMPLATE("<ul>${MAP(data.items, \'<li>\\${data}</li>\')}</ul>", {items: [1, 2, 3]})}')
      const result = fn({})
      assert.strictEqual(result, '<ul><li>1</li><li>2</li><li>3</li></ul>')
    })
  })

  describe('TEMPLATE with different data types', () => {
    const renderer = new ZzzBase()
    useIfMap(renderer)

    it('should handle string data', () => {
      const fn = renderer.compile('${TEMPLATE("Value: ${data}", "test")}')
      const result = fn({})
      assert.strictEqual(result, 'Value: test')
    })

    it('should handle number data', () => {
      const fn = renderer.compile('${TEMPLATE("Value: ${data}", 42)}')
      const result = fn({})
      assert.strictEqual(result, 'Value: 42')
    })

    it('should handle boolean data', () => {
      const fn = renderer.compile('${TEMPLATE("Value: ${data}", true)}')
      const result = fn({})
      assert.strictEqual(result, 'Value: true')
    })

    it('should handle array data', () => {
      const fn = renderer.compile('${TEMPLATE("Values: ${data.join(\', \')}", [1, 2, 3])}')
      const result = fn({})
      assert.strictEqual(result, 'Values: 1, 2, 3')
    })

    it('should handle object data', () => {
      const fn = renderer.compile('${TEMPLATE("Name: ${data.name}, Age: ${data.age}", {name: "Alice", age: 30})}')
      const result = fn({})
      assert.strictEqual(result, 'Name: Alice, Age: 30')
    })
  })

  describe('TEMPLATE dynamic usage', () => {
    const renderer = new ZzzBase()
    useIfMap(renderer)

    it('should use data from parent scope', () => {
      const fn = renderer.compile('${TEMPLATE("Hello ${data.name}", data)}')
      const result = fn({name: 'world'})
      assert.strictEqual(result, 'Hello world')
    })

    it('should work with computed template strings', () => {
      const fn = renderer.compile('${TEMPLATE(data.template, data.values)}')
      const result = fn({
        template: 'Product: ${data.product}, Price: ${data.price}',
        values: {product: 'Book', price: 10}
      })
      assert.strictEqual(result, 'Product: Book, Price: 10')
    })
  })

  describe('TEMPLATE error handling', () => {
    const renderer = new ZzzBase()
    useIfMap(renderer)

    it('should handle undefined data properties', () => {
      const fn = renderer.compile('${TEMPLATE("Value: ${data.missing}", {})}')
      const result = fn({})
      assert.strictEqual(result, 'Value: undefined')
    })

    it('should handle empty template string', () => {
      const fn = renderer.compile('${TEMPLATE("", {name: "world"})}')
      const result = fn({})
      assert.strictEqual(result, '')
    })
  })

  describe('TEMPLATE vs direct template literals', () => {
    const renderer = new ZzzBase()
    useIfMap(renderer)

    it('should produce same result as inline template', () => {
      const fn1 = renderer.compile('Hello ${data.name}')
      const fn2 = renderer.compile('${TEMPLATE("Hello ${data.name}", data)}')

      const result1 = fn1({name: 'world'})
      const result2 = fn2({name: 'world'})

      assert.strictEqual(result1, result2)
      assert.strictEqual(result1, 'Hello world')
    })
  })

  describe('TEMPLATE with conditional expressions', () => {
    const renderer = new ZzzBase()
    useIfMap(renderer)

    it('should handle ternary operators', () => {
      const fn = renderer.compile('${TEMPLATE("Status: ${data.active ? \'ON\' : \'OFF\'}", {active: true})}')
      const result = fn({})
      assert.strictEqual(result, 'Status: ON')
    })

    it('should handle logical operators', () => {
      const fn = renderer.compile('${TEMPLATE("Name: ${data.name || \'Unknown\'}", {})}')
      const result = fn({})
      assert.strictEqual(result, 'Name: Unknown')
    })
  })
})
