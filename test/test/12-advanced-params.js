import {it, describe} from 'node:test'
import assert from 'node:assert'
import {ZzzTemplateBase} from 'zzz-template'

describe('Advanced Plugin Parameters', () => {
  describe('compile with custom sign parameter', () => {
    const renderer = new ZzzTemplateBase()

    it('should use default sign "data, parent"', () => {
      const fn = renderer.compile('${data.name}')
      const result = fn({name: 'Alice'})
      assert.strictEqual(result, 'Alice')
    })

    it('should support parent parameter access', () => {
      const fn = renderer.compile('data: ${data}, parent: ${parent}')
      const result = fn('child', 'parentValue')
      assert.strictEqual(result, 'data: child, parent: parentValue')
    })

    it('should use custom sign parameter', () => {
      const fn = renderer.compile('Item: ${item}, Index: ${index}', {}, 'item, index')
      const result = fn('Apple', 0)
      assert.strictEqual(result, 'Item: Apple, Index: 0')
    })

    it('should work with custom sign and multiple parameters', () => {
      const fn = renderer.compile('${a} + ${b} = ${c}', {}, 'a, b, c')
      const result = fn(1, 2, 3)
      assert.strictEqual(result, '1 + 2 = 3')
    })

    it('should use custom sign with object destructuring', () => {
      const fn = renderer.compile('${x}, ${y}', {}, '{x, y}')
      const result = fn({x: 10, y: 20})
      assert.strictEqual(result, '10, 20')
    })
  })

  describe('parent parameter in nested contexts', () => {
    it('should pass parent data to nested compile', () => {
      const renderer = new ZzzTemplateBase()
      renderer.read = () => {}

      // Simulate nested rendering where parent is used
      const outerFn = renderer.compile('${data.name}', {}, 'data, parent')
      const innerFn = renderer.compile('child: ${data}, parent: ${parent}', {}, 'data, parent')

      assert.strictEqual(outerFn({name: 'outer'}), 'outer')
      assert.strictEqual(innerFn('inner', 'outer'), 'child: inner, parent: outer')
    })

    it('should handle undefined parent parameter', () => {
      const renderer = new ZzzTemplateBase()
      const fn = renderer.compile('data: ${data}, parent: ${parent}', {}, 'data, parent')
      const result = fn('value')
      assert.strictEqual(result, 'data: value, parent: undefined')
    })

    it('should use parent in complex template', () => {
      const renderer = new ZzzTemplateBase()
      const fn = renderer.compile('${data.child} from ${parent.name}', {}, 'data, parent')
      const result = fn({child: 'Alice'}, {name: 'Bob'})
      assert.strictEqual(result, 'Alice from Bob')
    })
  })
})
