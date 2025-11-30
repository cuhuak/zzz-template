import {it, describe} from 'node:test'
import assert from 'node:assert'
import {ZzzTemplateBase, useInclude, useLayout, useIfMap} from 'zzz-template'
import {ZzzTemplateNode} from 'zzz-template/node.js'

describe('Error Handling', () => {
  describe('missing template file (ZzzTemplateNode)', () => {
    const renderer = new ZzzTemplateNode({dir: './test'})

    it('should throw error when file not found', () => {
      assert.throws(
        () => renderer.render('non-existent-file.html', {}),
        /ENOENT|no such file/i
      )
    })
  })

  describe('missing template (custom read)', () => {
    const templates = {
      'main': 'Hello world'
    }

    const renderer = new ZzzTemplateBase()
    renderer.read = (f) => templates[f]

    it('should return undefined for missing template', () => {
      const fn = renderer.compile(renderer.read('missing'))
      const result = fn({})
      assert.strictEqual(result, 'undefined')
    })
  })

  describe('invalid template syntax', () => {
    const renderer = new ZzzTemplateBase()

    it('should throw on unclosed template literal', () => {
      assert.throws(
        () => renderer.compile('Hello ${data.name'),
        /Unexpected end of input|Unterminated template/i
      )
    })

    it('should throw on invalid JavaScript in template', () => {
      assert.throws(
        () => renderer.compile('Hello ${data.}'),
        /Unexpected token/i
      )
    })

    it('should allow extra closing braces outside template literal', () => {
      // Extra } outside ${} is valid JavaScript
      const fn = renderer.compile('Hello ${data.name}}')
      const result = fn({name: 'world'})
      assert.strictEqual(result, 'Hello world}')
    })
  })

  describe('undefined variables in templates', () => {
    const renderer = new ZzzTemplateBase()

    it('should render undefined as string "undefined"', () => {
      const fn = renderer.compile('Hello ${data.name}')
      const result = fn({})
      assert.strictEqual(result, 'Hello undefined')
    })

    it('should throw on accessing property of undefined', () => {
      const fn = renderer.compile('Hello ${data.user.name}')
      assert.throws(
        () => fn({}),
        /Cannot read propert/i
      )
    })

    it('should work with optional chaining', () => {
      const fn = renderer.compile('Hello ${data.user?.name}')
      const result = fn({})
      assert.strictEqual(result, 'Hello undefined')
    })

    it('should work with nullish coalescing', () => {
      const fn = renderer.compile('Hello ${data.name ?? "default"}')
      const result = fn({})
      assert.strictEqual(result, 'Hello default')
    })
  })

  describe('circular includes', () => {
    const templates = {
      'a': 'Template A ${INCLUDE("b", {})}',
      'b': 'Template B ${INCLUDE("a", {})}',
    }

    const renderer = new ZzzTemplateBase()
    renderer.read = (f) => templates[f]
    useInclude(renderer)

    it('should hit maximum call stack on circular includes', () => {
      assert.throws(
        () => renderer.render('a', {}),
        /Maximum call stack size exceeded/i
      )
    })
  })

  describe('circular layouts', () => {
    const templates = {
      'a': '${LAYOUT("b")}Content A',
      'b': '${LAYOUT("a")}Content B ${data.content}',
    }

    const renderer = new ZzzTemplateBase()
    renderer.read = (f) => templates[f]
    useLayout(renderer)

    it('should hit maximum call stack on circular layouts', () => {
      assert.throws(
        () => renderer.render('a', {}),
        /Maximum call stack size exceeded/i
      )
    })
  })

  describe('self-referencing templates', () => {
    const templates = {
      'recursive': '${INCLUDE("recursive", {})}',
    }

    const renderer = new ZzzTemplateBase()
    renderer.read = (f) => templates[f]
    useInclude(renderer)

    it('should hit maximum call stack on self-reference', () => {
      assert.throws(
        () => renderer.render('recursive', {}),
        /Maximum call stack size exceeded/i
      )
    })
  })

  describe('invalid data types to functions', () => {
    const renderer = new ZzzTemplateBase()
    useIfMap(renderer)

    it('should throw when MAP receives non-array', () => {
      const fn = renderer.compile('${MAP("not an array", "<li>${data}</li>")}')
      assert.throws(
        () => fn({}),
        /is not a function|is not iterable/i
      )
    })

    it('should handle null in MAP', () => {
      const fn = renderer.compile('${MAP(data.items, "<li>${data}</li>")}')
      assert.throws(
        () => fn({items: null}),
        /Cannot read properties of null/i
      )
    })

    it('should handle undefined in MAP', () => {
      const fn = renderer.compile('${MAP(data.items, "<li>${data}</li>")}')
      assert.throws(
        () => fn({}),
        /Cannot read properties of undefined/i
      )
    })
  })

  describe('INCLUDE with missing template', () => {
    const templates = {
      'main': '${INCLUDE("missing", {})}',
    }

    const renderer = new ZzzTemplateBase()
    renderer.read = (f) => templates[f]
    useInclude(renderer)

    it('should compile undefined template', () => {
      const result = renderer.render('main', {})
      assert.strictEqual(result, 'undefined')
    })
  })

  describe('IFI with missing template', () => {
    const templates = {
      'main': '${IFI(true, "missing", {})}',
    }

    const renderer = new ZzzTemplateBase()
    renderer.read = (f) => templates[f]
    useIfMap(renderer)

    it('should compile undefined template when condition is true', () => {
      const result = renderer.render('main', {})
      assert.strictEqual(result, 'undefined')
    })
  })

  describe('MAPI with missing template', () => {
    const templates = {
      'main': '${MAPI([1, 2, 3], "missing")}',
    }

    const renderer = new ZzzTemplateBase()
    renderer.read = (f) => templates[f]
    useIfMap(renderer)

    it('should compile undefined template for each item', () => {
      const result = renderer.render('main', {})
      assert.strictEqual(result, 'undefinedundefinedundefined')
    })
  })

  describe('runtime errors in template expressions', () => {
    const renderer = new ZzzTemplateBase()

    it('should throw on division by zero producing Infinity', () => {
      const fn = renderer.compile('Result: ${1 / 0}')
      const result = fn({})
      assert.strictEqual(result, 'Result: Infinity')
    })

    it('should throw on function call error', () => {
      const fn = renderer.compile('${data.func()}')
      assert.throws(
        () => fn({func: null}),
        /is not a function/i
      )
    })

    it('should throw on reference error', () => {
      const fn = renderer.compile('${nonExistentVariable}')
      assert.throws(
        () => fn({}),
        /is not defined/i
      )
    })
  })

  describe('compile with invalid parameters', () => {
    const renderer = new ZzzTemplateBase()

    it('should handle null template', () => {
      // null is converted to string "null" by template literal
      const fn = renderer.compile(null)
      const result = fn({})
      assert.strictEqual(result, 'null')
    })

    it('should handle undefined template', () => {
      // undefined is converted to string "undefined" by template literal
      const fn = renderer.compile(undefined)
      const result = fn({})
      assert.strictEqual(result, 'undefined')
    })

    it('should handle number template', () => {
      const fn = renderer.compile(123)
      const result = fn({})
      assert.strictEqual(result, '123')
    })
  })
})
