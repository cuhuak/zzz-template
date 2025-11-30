import {it, describe} from 'node:test'
import assert from 'node:assert'
import {ZzzTemplateBase, useIfMap, useLocal} from 'zzz-template'

describe('Complex useIfMap Scenarios', () => {
  describe('nested IF statements', () => {
    const renderer = new ZzzTemplateBase()
    useIfMap(renderer)

    it('should support nested IF with both true', () => {
      const fn = renderer.compile('${IF(data.a, "${IF(data.b, \\"Both true\\", data)}", data)}')
      const result = fn({a: true, b: true})
      assert.strictEqual(result, 'Both true')
    })

    it('should support nested IF with inner false', () => {
      const fn = renderer.compile('${IF(data.a, "${IF(data.b, \\"Inner true\\", data)}", data)}')
      const result = fn({a: true, b: false})
      assert.strictEqual(result, '')
    })

    it('should support 3 levels of nesting', () => {
      const fn = renderer.compile('${IF(data.a, "${IF(data.b, \\"${IF(data.c, \\\\\\"Level 3\\\\\\", data)}\\" , data)}", data)}')
      const result = fn({a: true, b: true, c: true})
      assert.strictEqual(result, 'Level 3')
    })
  })

  describe('IF inside MAP', () => {
    const renderer = new ZzzTemplateBase()
    useIfMap(renderer)

    it('should use IF inside MAP to conditionally render items', () => {
      const fn = renderer.compile('${MAP(data.items, "${IF(data > 2, \\"<b>\\${data}</b>\\", data)}")}')
      const result = fn({items: [1, 2, 3, 4]})
      // IF only renders when condition is true, otherwise returns empty string
      assert.strictEqual(result, '<b>3</b><b>4</b>')
    })

    it('should filter items with IF in MAP', () => {
      const fn = renderer.compile('${MAP(data.items, "${IF(data % 2 === 0, \\"\\${data}\\", data)}")}')
      const result = fn({items: [1, 2, 3, 4, 5]})
      // Only even numbers (2, 4) are rendered since IF returns '' for odd numbers
      assert.strictEqual(result, '24')
    })
  })

  describe('MAP inside IF', () => {
    const renderer = new ZzzTemplateBase()
    useIfMap(renderer)

    it('should render MAP when condition is true', () => {
      const fn = renderer.compile('${IF(data.showItems, "${MAP(data.items, \\"<li>\\${data}</li>\\")}", data)}')
      const result = fn({showItems: true, items: [1, 2, 3]})
      assert.strictEqual(result, '<li>1</li><li>2</li><li>3</li>')
    })

    it('should not render MAP when condition is false', () => {
      const fn = renderer.compile('${IF(data.showItems, "${MAP(data.items, \\"<li>\\${data}</li>\\")}", data)}')
      const result = fn({showItems: false, items: [1, 2, 3]})
      assert.strictEqual(result, '')
    })
  })

  describe('MAPI with nested templates', () => {
    const templates = {
      'main': '${MAPI(data.users, "user-card")}',
      'user-card': '<div>${INCLUDE("user-name", data)}${INCLUDE("user-age", data)}</div>',
      'user-name': '<span>${data.name}</span>',
      'user-age': '<span>${data.age}</span>',
    }

    const renderer = new ZzzTemplateBase()
    renderer.read = (f) => templates[f]
    useIfMap(renderer)  // useIfMap includes useInclude internally

    it('should support MAPI with nested includes', () => {
      const result = renderer.render('main', {
        users: [{name: 'Alice', age: 30}, {name: 'Bob', age: 25}]
      })
      assert.strictEqual(result, '<div><span>Alice</span><span>30</span></div><div><span>Bob</span><span>25</span></div>')
    })
  })

  describe('IFI with nested includes', () => {
    const templates = {
      'main': '${IFI(data.showCard, "user-card", data.user)}',
      'user-card': '${INCLUDE("header", {})}Name: ${data.name}${INCLUDE("footer", {})}',
      'header': '<header>',
      'footer': '</header>',
    }

    const renderer = new ZzzTemplateBase()
    renderer.read = (f) => templates[f]
    useIfMap(renderer)  // useIfMap includes useInclude internally

    it('should support IFI with nested includes', () => {
      const result = renderer.render('main', {
        showCard: true,
        user: {name: 'Alice'}
      })
      assert.strictEqual(result, '<header>Name: Alice</header>')
    })

    it('should not render when condition is false', () => {
      const result = renderer.render('main', {
        showCard: false,
        user: {name: 'Alice'}
      })
      assert.strictEqual(result, '')
    })
  })

  describe('empty array handling in MAP/MAPI', () => {
    const templates = {
      'map': 'Start${MAP(data.items, "<li>${data}</li>")}End',
      'mapi': 'Start${MAPI(data.items, "item")}End',
      'item': '<li>${data}</li>',
    }

    const renderer = new ZzzTemplateBase()
    renderer.read = (f) => templates[f]
    useIfMap(renderer)

    it('should handle empty array in MAP', () => {
      const result = renderer.render('map', {items: []})
      assert.strictEqual(result, 'StartEnd')
    })

    it('should handle empty array in MAPI', () => {
      const result = renderer.render('mapi', {items: []})
      assert.strictEqual(result, 'StartEnd')
    })
  })

  describe('falsy values in IF conditions', () => {
    const renderer = new ZzzTemplateBase()
    useIfMap(renderer)

    it('should handle 0 as falsy', () => {
      const fn = renderer.compile('${IF(data.value, "true", data)}')
      const result = fn({value: 0})
      assert.strictEqual(result, '')
    })

    it('should handle empty string as falsy', () => {
      const fn = renderer.compile('${IF(data.value, "true", data)}')
      const result = fn({value: ''})
      assert.strictEqual(result, '')
    })

    it('should handle false as falsy', () => {
      const fn = renderer.compile('${IF(data.value, "true", data)}')
      const result = fn({value: false})
      assert.strictEqual(result, '')
    })

    it('should handle null as falsy', () => {
      const fn = renderer.compile('${IF(data.value, "true", data)}')
      const result = fn({value: null})
      assert.strictEqual(result, '')
    })

    it('should handle undefined as falsy', () => {
      const fn = renderer.compile('${IF(data.value, "true", data)}')
      const result = fn({})
      assert.strictEqual(result, '')
    })

    it('should handle NaN as falsy', () => {
      const fn = renderer.compile('${IF(data.value, "true", data)}')
      const result = fn({value: NaN})
      assert.strictEqual(result, '')
    })
  })

  describe('truthy values in IF conditions', () => {
    const renderer = new ZzzTemplateBase()
    useIfMap(renderer)

    it('should handle non-zero number as truthy', () => {
      const fn = renderer.compile('${IF(data.value, "true", data)}')
      const result = fn({value: 42})
      assert.strictEqual(result, 'true')
    })

    it('should handle non-empty string as truthy', () => {
      const fn = renderer.compile('${IF(data.value, "true", data)}')
      const result = fn({value: 'hello'})
      assert.strictEqual(result, 'true')
    })

    it('should handle true as truthy', () => {
      const fn = renderer.compile('${IF(data.value, "true", data)}')
      const result = fn({value: true})
      assert.strictEqual(result, 'true')
    })

    it('should handle object as truthy', () => {
      const fn = renderer.compile('${IF(data.value, "true", data)}')
      const result = fn({value: {}})
      assert.strictEqual(result, 'true')
    })

    it('should handle array as truthy', () => {
      const fn = renderer.compile('${IF(data.value, "true", data)}')
      const result = fn({value: []})
      assert.strictEqual(result, 'true')
    })
  })

  describe('complex IF/MAP combinations', () => {
    const renderer = new ZzzTemplateBase()
    useIfMap(renderer)

    it('should support IF inside MAP inside IF', () => {
      const fn = renderer.compile('${IF(data.show, "${MAP(data.items, \\"${IF(data > 2, \\\\\\"\\\\\\${data}\\\\\\", data)}\\" )}", data)}')
      const result = fn({show: true, items: [1, 2, 3, 4]})
      assert.strictEqual(result, '34')
    })

    it('should support multiple MAPs with IFs', () => {
      const fn = renderer.compile('${MAP(data.a, "${IF(data, \\"A\\${data}\\", data)}")} ${MAP(data.b, "${IF(data, \\"B\\${data}\\", data)}")}')
      const result = fn({a: [1, 0, 2], b: [3, 0, 4]})
      assert.strictEqual(result, 'A1A2 B3B4')
    })
  })

  describe('MAP/MAPI with complex data transformations', () => {
    const renderer = new ZzzTemplateBase()
    useIfMap(renderer)

    it('should support arithmetic in MAP', () => {
      const fn = renderer.compile('${MAP(data.items, "\\${data * 2}")}')
      const result = fn({items: [1, 2, 3]})
      assert.strictEqual(result, '246')
    })

    it('should support string concatenation in MAP', () => {
      const fn = renderer.compile('${MAP(data.items, "Item: \\${data}")}')
      const result = fn({items: ['A', 'B', 'C']})
      assert.strictEqual(result, 'Item: AItem: BItem: C')
    })

    it('should access nested properties in MAP', () => {
      const fn = renderer.compile('${MAP(data.users, "\\${data.name}: \\${data.age}")}')
      const result = fn({users: [{name: 'Alice', age: 30}, {name: 'Bob', age: 25}]})
      assert.strictEqual(result, 'Alice: 30Bob: 25')
    })
  })

  describe('IF/IFI with complex conditions', () => {
    const templates = {
      'main': '${IFI(data.age >= 18 && data.verified, "adult", data)}${IFI(data.age < 18, "minor", data)}',
      'adult': 'Adult: ${data.name}',
      'minor': 'Minor: ${data.name}',
    }

    const renderer = new ZzzTemplateBase()
    renderer.read = (f) => templates[f]
    useIfMap(renderer)

    it('should support complex boolean expressions in IFI', () => {
      const result = renderer.render('main', {name: 'Alice', age: 20, verified: true})
      assert.strictEqual(result, 'Adult: Alice')
    })

    it('should handle failed complex condition', () => {
      const result = renderer.render('main', {name: 'Alice', age: 20, verified: false})
      assert.strictEqual(result, '')
    })

    it('should handle minor case', () => {
      const result = renderer.render('main', {name: 'Bob', age: 15, verified: false})
      assert.strictEqual(result, 'Minor: Bob')
    })
  })

  describe('MAP/MAPI with local variables', () => {
    const templates = {
      'main': '${SET("prefix", "Item")}${MAP(data.items, "\\${local.prefix}: \\${data}")}',
    }

    const renderer = new ZzzTemplateBase()
    renderer.read = (f) => templates[f]
    useIfMap(renderer)
    useLocal(renderer)

    it('should access local variables inside MAP', () => {
      const result = renderer.render('main', {items: [1, 2, 3]})
      assert.strictEqual(result, 'Item: 1Item: 2Item: 3')
    })
  })
})
