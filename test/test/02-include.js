import {it, describe} from 'node:test'
import assert from 'node:assert'
import {ZzzTemplateBase, useInclude, useLocal} from 'zzz-template'

describe('useInclude', () => {
  describe('basic INCLUDE functionality', () => {
    const templates = {
      'main': 'Start ${INCLUDE("partial", {name: data.name})} End',
      'partial': 'Hello ${data.name}!',
    }

    const renderer = new ZzzTemplateBase()
    renderer.read = (f) => templates[f]
    useInclude(renderer)

    it('should include partial template', () => {
      const result = renderer.render('main', {name: 'world'})
      assert.strictEqual(result, 'Start Hello world! End')
    })
  })

  describe('INCLUDE with different data objects', () => {
    const templates = {
      'main': '${INCLUDE("user", {name: "Alice", age: 30})} ${INCLUDE("user", {name: "Bob", age: 25})}',
      'user': '${data.name}:${data.age}',
    }

    const renderer = new ZzzTemplateBase()
    renderer.read = (f) => templates[f]
    useInclude(renderer)

    it('should pass different data to includes', () => {
      const result = renderer.render('main', {})
      assert.strictEqual(result, 'Alice:30 Bob:25')
    })
  })

  describe('nested includes', () => {
    const templates = {
      'main': 'Level 0 ${INCLUDE("level1", {n: 1})}',
      'level1': 'Level 1 ${INCLUDE("level2", {n: 2})}',
      'level2': 'Level 2 (${data.n})',
    }

    const renderer = new ZzzTemplateBase()
    renderer.read = (f) => templates[f]
    useInclude(renderer)

    it('should support nested includes', () => {
      const result = renderer.render('main', {})
      assert.strictEqual(result, 'Level 0 Level 1 Level 2 (2)')
    })
  })

  describe('INCLUDE with local variables', () => {
    const templates = {
      'main': '${SET("title", "Main Title")}${INCLUDE("partial", {name: "world"})}',
      'partial': 'Title: ${local.title}, Hello ${data.name}!',
    }

    const renderer = new ZzzTemplateBase()
    renderer.read = (f) => templates[f]
    useInclude(renderer)
    useLocal(renderer)

    it('should access local variables from parent', () => {
      const result = renderer.render('main', {})
      assert.strictEqual(result, 'Title: Main Title, Hello world!')
    })
  })

  describe('INCLUDE with undefined/null data', () => {
    const templates = {
      'main': '${INCLUDE("partial", data.missing)}',
      'partial': 'Data: ${data}',
    }

    const renderer = new ZzzTemplateBase()
    renderer.read = (f) => templates[f]
    useInclude(renderer)

    it('should handle undefined data', () => {
      const result = renderer.render('main', {})
      assert.strictEqual(result, 'Data: undefined')
    })

    it('should handle null data', () => {
      const result = renderer.render('main', {missing: null})
      assert.strictEqual(result, 'Data: null')
    })
  })

  describe('multiple includes in template', () => {
    const templates = {
      'main': '${INCLUDE("header", {title: "My Page"})} ${INCLUDE("content", {text: "Body"})} ${INCLUDE("footer", {})}',
      'header': '<h1>${data.title}</h1>',
      'content': '<p>${data.text}</p>',
      'footer': '<footer>Footer</footer>',
    }

    const renderer = new ZzzTemplateBase()
    renderer.read = (f) => templates[f]
    useInclude(renderer)

    it('should support multiple includes', () => {
      const result = renderer.render('main', {})
      assert.strictEqual(result, '<h1>My Page</h1> <p>Body</p> <footer>Footer</footer>')
    })
  })

  describe('INCLUDE with array data', () => {
    const templates = {
      'main': '${INCLUDE("list", {items: [1, 2, 3]})}',
      'list': 'Items: ${data.items.join(", ")}',
    }

    const renderer = new ZzzTemplateBase()
    renderer.read = (f) => templates[f]
    useInclude(renderer)

    it('should pass array data to include', () => {
      const result = renderer.render('main', {})
      assert.strictEqual(result, 'Items: 1, 2, 3')
    })
  })

  describe('INCLUDE preserves parent data context', () => {
    const templates = {
      'main': 'Parent: ${data.parent} ${INCLUDE("child", {child: "value"})}',
      'child': 'Child: ${data.child}',
    }

    const renderer = new ZzzTemplateBase()
    renderer.read = (f) => templates[f]
    useInclude(renderer)

    it('should not affect parent data', () => {
      const result = renderer.render('main', {parent: 'main'})
      assert.strictEqual(result, 'Parent: main Child: value')
    })
  })
})