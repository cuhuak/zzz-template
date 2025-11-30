import {it, describe} from 'node:test'
import assert from 'node:assert'
import {ZzzTemplateBase, useLayout, useLocal, useIfMap, useInclude} from 'zzz-template'

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

  describe('useIfMap with aliases parameter', () => {
    it('should create aliases by default (aliases=true)', () => {
      const renderer = new ZzzTemplateBase()
      useIfMap(renderer)

      const fn = renderer.compile('${IF(data.show, "visible", data)}')
      const result = fn({show: true})
      assert.strictEqual(result, 'visible')
    })

    it('should not create aliases when aliases=false', () => {
      const renderer = new ZzzTemplateBase()
      useIfMap(renderer, false)

      // Functions should be available via this.$
      const fn = renderer.compile('${this.if_template(data.show, "visible", data)}')
      const result = fn({show: true})
      assert.strictEqual(result, 'visible')
    })

    it('should throw ReferenceError when using IF without aliases', () => {
      const renderer = new ZzzTemplateBase()
      useIfMap(renderer, false)

      assert.throws(() => {
        const fn = renderer.compile('${IF(data.show, "visible", data)}')
        fn({show: true})
      }, ReferenceError)
    })

    it('should access TEMPLATE via this.template when aliases=false', () => {
      const renderer = new ZzzTemplateBase()
      useIfMap(renderer, false)

      const fn = renderer.compile('${this.template("Hello ${data.name}", {name: "World"})}')
      const result = fn({})
      assert.strictEqual(result, 'Hello World')
    })

    it('should access MAP via this.map_template when aliases=false', () => {
      const renderer = new ZzzTemplateBase()
      useIfMap(renderer, false)

      const fn = renderer.compile('${this.map_template(data.items, "<i>${data}</i>")}')
      const result = fn({items: [1, 2, 3]})
      assert.strictEqual(result, '<i>1</i><i>2</i><i>3</i>')
    })

    it('should access MAPI via this.map_include when aliases=false', () => {
      const templates = {
        'main': '${this.map_include(data.items, "item")}',
        'item': '<li>${data}</li>',
      }

      const renderer = new ZzzTemplateBase()
      renderer.read = (f) => templates[f]
      useIfMap(renderer, false)

      const result = renderer.render('main', {items: [1, 2]})
      assert.strictEqual(result, '<li>1</li><li>2</li>')
    })

    it('should access IFI via this.if_include when aliases=false', () => {
      const templates = {
        'main': '${this.if_include(data.show, "partial", data)}',
        'partial': 'Content: ${data.value}',
      }

      const renderer = new ZzzTemplateBase()
      renderer.read = (f) => templates[f]
      useIfMap(renderer, false)

      const result = renderer.render('main', {show: true, value: 'test'})
      assert.strictEqual(result, 'Content: test')
    })
  })

  describe('useLayout with custom alias', () => {
    it('should use LAYOUT as default alias', () => {
      const templates = {
        'page': '${LAYOUT("layout")}Content',
        'layout': '<div>${data.content}</div>',
      }

      const renderer = new ZzzTemplateBase()
      renderer.read = (f) => templates[f]
      useLayout(renderer)

      const result = renderer.render('page', {})
      assert.strictEqual(result, '<div>Content</div>')
    })

    it('should use custom alias when provided', () => {
      const templates = {
        'page': '${L("layout")}Content',
        'layout': '<div>${data.content}</div>',
      }

      const renderer = new ZzzTemplateBase()
      renderer.read = (f) => templates[f]
      useLayout(renderer, 'L')

      const result = renderer.render('page', {})
      assert.strictEqual(result, '<div>Content</div>')
    })

    it('should use WRAP as custom alias', () => {
      const templates = {
        'page': '${WRAP("layout", {title: "Test"})}Page Content',
        'layout': '<h1>${data.title}</h1>${data.content}',
      }

      const renderer = new ZzzTemplateBase()
      renderer.read = (f) => templates[f]
      useLayout(renderer, 'WRAP')

      const result = renderer.render('page', {})
      assert.strictEqual(result, '<h1>Test</h1>Page Content')
    })

    it('should throw error when using LAYOUT with custom alias', () => {
      const templates = {
        'page': '${LAYOUT("layout")}Content',
        'layout': '<div>${data.content}</div>',
      }

      const renderer = new ZzzTemplateBase()
      renderer.read = (f) => templates[f]
      useLayout(renderer, 'L')

      assert.throws(() => {
        renderer.render('page', {})
      }, ReferenceError)
    })
  })

  describe('useLocal with custom aliases', () => {
    it('should use SET and SETA as default aliases', () => {
      const renderer = new ZzzTemplateBase()
      useLocal(renderer)

      const fn = renderer.compile('${SET("x", 1)}${SETA("y", 2, 3)}${local.x},${local.y}', {})
      const result = fn({})
      assert.strictEqual(result, '1,2,3')
    })

    it('should use custom aliases when provided', () => {
      const renderer = new ZzzTemplateBase()
      useLocal(renderer, 'VAR', 'PUSH')

      const fn = renderer.compile('${VAR("x", 1)}${PUSH("y", 2, 3)}${local.x},${local.y}', {})
      const result = fn({})
      assert.strictEqual(result, '1,2,3')
    })

    it('should use LET and APPEND as custom aliases', () => {
      const renderer = new ZzzTemplateBase()
      useLocal(renderer, 'LET', 'APPEND')

      const fn = renderer.compile('${LET("name", "Alice")}${APPEND("tags", "js", "css")}${local.name}:${local.tags}', {})
      const result = fn({})
      assert.strictEqual(result, 'Alice:js,css')
    })

    it('should throw error when using SET with custom aliases', () => {
      const renderer = new ZzzTemplateBase()
      useLocal(renderer, 'VAR', 'PUSH')

      assert.throws(() => {
        const fn = renderer.compile('${SET("x", 1)}', {})
        fn({})
      }, ReferenceError)
    })

    it('should throw error when using SETA with custom aliases', () => {
      const renderer = new ZzzTemplateBase()
      useLocal(renderer, 'VAR', 'PUSH')

      assert.throws(() => {
        const fn = renderer.compile('${SETA("x", 1)}', {})
        fn({})
      }, ReferenceError)
    })

    it('should allow single character aliases', () => {
      const renderer = new ZzzTemplateBase()
      useLocal(renderer, 'S', 'A')

      const fn = renderer.compile('${S("x", 10)}${A("x", 20)}${local.x}', {})
      const result = fn({})
      assert.strictEqual(result, '10,20')
    })
  })

  describe('useInclude with custom alias', () => {
    it('should use INCLUDE as default alias', () => {
      const templates = {
        'main': '${INCLUDE("partial", {name: "World"})}',
        'partial': 'Hello ${data.name}!',
      }

      const renderer = new ZzzTemplateBase()
      renderer.read = (f) => templates[f]
      useInclude(renderer)

      const result = renderer.render('main', {})
      assert.strictEqual(result, 'Hello World!')
    })

    it('should use custom alias when provided', () => {
      const templates = {
        'main': '${LOAD("partial", {name: "World"})}',
        'partial': 'Hello ${data.name}!',
      }

      const renderer = new ZzzTemplateBase()
      renderer.read = (f) => templates[f]
      useInclude(renderer, 'LOAD')

      const result = renderer.render('main', {})
      assert.strictEqual(result, 'Hello World!')
    })

    it('should use PARTIAL as custom alias', () => {
      const templates = {
        'main': 'Start ${PARTIAL("content", data)} End',
        'content': 'Content: ${data.value}',
      }

      const renderer = new ZzzTemplateBase()
      renderer.read = (f) => templates[f]
      useInclude(renderer, 'PARTIAL')

      const result = renderer.render('main', {value: 'test'})
      assert.strictEqual(result, 'Start Content: test End')
    })
  })

  describe('combining custom aliases', () => {
    it('should use all custom aliases together', () => {
      const templates = {
        'page': '${V("title", "My Page")}${W("layout")}${L("header", {})}${data.content}',
        'layout': '<main>${data.content}</main>',
        'header': '<h1>${local.title}</h1>',
      }

      const renderer = new ZzzTemplateBase()
      renderer.read = (f) => templates[f]
      useLocal(renderer, 'V', 'A')
      useLayout(renderer, 'W')
      useInclude(renderer, 'L')

      const result = renderer.render('page', {content: 'Body'})
      assert.strictEqual(result, '<main><h1>My Page</h1>Body</main>')
    })

    it('should work with useIfMap aliases=false and custom local aliases', () => {
      const renderer = new ZzzTemplateBase()
      useLocal(renderer, 'DEF', 'ADD')
      useIfMap(renderer, false)

      const fn = renderer.compile('${DEF("x", 5)}${this.if_template(data.show, "${local.x}", data)}', {})
      const result = fn({show: true})
      assert.strictEqual(result, '5')
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
