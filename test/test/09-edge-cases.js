import {it, describe} from 'node:test'
import assert from 'node:assert'
import {ZzzTemplateBase, useContentTrim, useIfMap, useInclude} from 'zzz-template'

describe('Edge Cases', () => {
  describe('empty string templates', () => {
    const renderer = new ZzzTemplateBase()

    it('should handle empty template', () => {
      const fn = renderer.compile('')
      const result = fn({})
      assert.strictEqual(result, '')
    })

    it('should handle template with only whitespace', () => {
      const fn = renderer.compile('   \n  \t  ')
      const result = fn({})
      assert.strictEqual(result, '   \n  \t  ')
    })

    it('should trim empty template', () => {
      const renderer2 = new ZzzTemplateBase()
      useContentTrim(renderer2)
      const fn = renderer2.compile('   ')
      const result = fn({})
      assert.strictEqual(result, '')
    })
  })

  describe('very long strings', () => {
    const renderer = new ZzzTemplateBase()

    it('should handle 10KB template', () => {
      const longText = 'a'.repeat(10000)
      const fn = renderer.compile(`Start ${longText} End`)
      const result = fn({})
      assert.strictEqual(result, `Start ${longText} End`)
    })

    it('should handle 10KB data', () => {
      const longText = 'b'.repeat(10000)
      const fn = renderer.compile('${data.text}')
      const result = fn({text: longText})
      assert.strictEqual(result, longText)
    })

    it('should handle many variables', () => {
      const template = Array(100).fill('${data.x}').join(' ')
      const fn = renderer.compile(template)
      const result = fn({x: 'X'})
      const expected = Array(100).fill('X').join(' ')
      assert.strictEqual(result, expected)
    })
  })

  describe('special characters', () => {
    const renderer = new ZzzTemplateBase()

    it('should handle quotes in template', () => {
      const fn = renderer.compile('He said "Hello" and \'Hi\'')
      const result = fn({})
      assert.strictEqual(result, 'He said "Hello" and \'Hi\'')
    })

    it('should handle newlines in template', () => {
      const fn = renderer.compile('Line 1\nLine 2\nLine 3')
      const result = fn({})
      assert.strictEqual(result, 'Line 1\nLine 2\nLine 3')
    })

    it('should handle tabs in template', () => {
      const fn = renderer.compile('Col1\tCol2\tCol3')
      const result = fn({})
      assert.strictEqual(result, 'Col1\tCol2\tCol3')
    })

    it('should handle backslashes', () => {
      const fn = renderer.compile('Path: C:\\\\Users\\\\Name')
      const result = fn({})
      assert.strictEqual(result, 'Path: C:\\Users\\Name')
    })

    it('should handle mixed special characters', () => {
      const fn = renderer.compile('Mixed: "quotes" \n \t \\`backtick\\`')
      const result = fn({})
      assert.strictEqual(result, 'Mixed: "quotes" \n \t `backtick`')
    })
  })

  describe('unicode and emoji in templates', () => {
    const renderer = new ZzzTemplateBase()

    it('should handle emoji', () => {
      const fn = renderer.compile('Hello 👋 World 🌍')
      const result = fn({})
      assert.strictEqual(result, 'Hello 👋 World 🌍')
    })

    it('should handle emoji in data', () => {
      const fn = renderer.compile('Message: ${data.msg}')
      const result = fn({msg: '🎉 Party! 🎊'})
      assert.strictEqual(result, 'Message: 🎉 Party! 🎊')
    })

    it('should handle unicode characters', () => {
      const fn = renderer.compile('Unicode: α β γ δ 中文 日本語 한글')
      const result = fn({})
      assert.strictEqual(result, 'Unicode: α β γ δ 中文 日本語 한글')
    })

    it('should handle combining characters', () => {
      const fn = renderer.compile('Café')
      const result = fn({})
      assert.strictEqual(result, 'Café')
    })

    it('should handle right-to-left text', () => {
      const fn = renderer.compile('RTL: مرحبا שלום')
      const result = fn({})
      assert.strictEqual(result, 'RTL: مرحبا שלום')
    })
  })

  describe('HTML entities', () => {
    const renderer = new ZzzTemplateBase()

    it('should preserve HTML entities', () => {
      const fn = renderer.compile('&lt;div&gt; &amp; &quot;')
      const result = fn({})
      assert.strictEqual(result, '&lt;div&gt; &amp; &quot;')
    })

    it('should handle HTML entities in data', () => {
      const fn = renderer.compile('${data.html}')
      const result = fn({html: '&nbsp;&copy;&reg;'})
      assert.strictEqual(result, '&nbsp;&copy;&reg;')
    })

    it('should not decode entities', () => {
      const fn = renderer.compile('Entity: &lt;script&gt;')
      const result = fn({})
      assert.strictEqual(result, 'Entity: &lt;script&gt;')
    })
  })

  describe('template with only variables', () => {
    const renderer = new ZzzTemplateBase()

    it('should handle single variable', () => {
      const fn = renderer.compile('${data.value}')
      const result = fn({value: 'test'})
      assert.strictEqual(result, 'test')
    })

    it('should handle multiple variables only', () => {
      const fn = renderer.compile('${data.a}${data.b}${data.c}')
      const result = fn({a: '1', b: '2', c: '3'})
      assert.strictEqual(result, '123')
    })

    it('should handle complex expression only', () => {
      const fn = renderer.compile('${data.a + data.b}')
      const result = fn({a: 10, b: 20})
      assert.strictEqual(result, '30')
    })
  })

  describe('template with only static text', () => {
    const renderer = new ZzzTemplateBase()

    it('should handle static text with no variables', () => {
      const fn = renderer.compile('Hello World!')
      const result = fn({})
      assert.strictEqual(result, 'Hello World!')
    })

    it('should handle multiline static text', () => {
      const text = 'Line 1\nLine 2\nLine 3'
      const fn = renderer.compile(text)
      const result = fn({})
      assert.strictEqual(result, text)
    })
  })

  describe('dollar sign without braces', () => {
    const renderer = new ZzzTemplateBase()

    it('should preserve standalone dollar sign', () => {
      const fn = renderer.compile('Price: $10')
      const result = fn({})
      assert.strictEqual(result, 'Price: $10')
    })

    it('should preserve multiple dollar signs', () => {
      const fn = renderer.compile('$$$ Expensive $$$')
      const result = fn({})
      assert.strictEqual(result, '$$$ Expensive $$$')
    })

    it('should handle dollar before regular braces', () => {
      const fn = renderer.compile('Object: ${data}')
      const result = fn()
      assert.strictEqual(result, 'Object: undefined')
    })
  })

  describe('nested template literals', () => {
    const renderer = new ZzzTemplateBase()
    useIfMap(renderer)

    it('should handle escaped nested templates', () => {
      const fn = renderer.compile('${TEMPLATE("Inner: \\${data}", 42)}')
      const result = fn({})
      assert.strictEqual(result, 'Inner: 42')
    })

    it('should handle multiple levels of escaping', () => {
      const fn = renderer.compile('${TEMPLATE("${TEMPLATE(\\"\\\\${data}\\", 42)}", {})}')
      const result = fn({})
      assert.strictEqual(result, '42')
    })
  })

  describe('extreme nesting', () => {
    const renderer = new ZzzTemplateBase()

    it('should handle deeply nested property access', () => {
      const fn = renderer.compile('${data.a.b.c.d.e}')
      const result = fn({a: {b: {c: {d: {e: 'deep'}}}}})
      assert.strictEqual(result, 'deep')
    })

    it('should handle nested array access', () => {
      const fn = renderer.compile('${data.arr[0][1][2]}')
      const result = fn({arr: [[null, [null, null, 'nested']]]})
      assert.strictEqual(result, 'nested')
    })
  })

  describe('template with comments-like text', () => {
    const renderer = new ZzzTemplateBase()

    it('should preserve comment-like syntax', () => {
      const fn = renderer.compile('<!-- This looks like a comment -->')
      const result = fn({})
      assert.strictEqual(result, '<!-- This looks like a comment -->')
    })

    it('should preserve JS comment syntax', () => {
      const fn = renderer.compile('// This looks like a comment\n/* Or this */')
      const result = fn({})
      assert.strictEqual(result, '// This looks like a comment\n/* Or this */')
    })
  })

  describe('data with circular references', () => {
    const renderer = new ZzzTemplateBase()

    it('should handle circular object in data (JSON.stringify throws)', () => {
      const circular = {a: 1}
      circular.self = circular

      const fn = renderer.compile('${data.a}')
      const result = fn(circular)
      assert.strictEqual(result, '1')
    })
  })

  describe('undefined vs null handling', () => {
    const renderer = new ZzzTemplateBase()

    it('should distinguish undefined from null in output', () => {
      const fn = renderer.compile('Undefined: ${data.undef}, Null: ${data.nul}')
      const result = fn({undef: undefined, nul: null})
      assert.strictEqual(result, 'Undefined: undefined, Null: null')
    })

    it('should handle missing vs null', () => {
      const fn = renderer.compile('Missing: ${data.missing}, Null: ${data.nul}')
      const result = fn({nul: null})
      assert.strictEqual(result, 'Missing: undefined, Null: null')
    })
  })

  describe('numbers and numeric edge cases', () => {
    const renderer = new ZzzTemplateBase()

    it('should handle zero', () => {
      const fn = renderer.compile('${data.val}')
      const result = fn({val: 0})
      assert.strictEqual(result, '0')
    })

    it('should handle negative numbers', () => {
      const fn = renderer.compile('${data.val}')
      const result = fn({val: -42})
      assert.strictEqual(result, '-42')
    })

    it('should handle decimals', () => {
      const fn = renderer.compile('${data.val}')
      const result = fn({val: 3.14159})
      assert.strictEqual(result, '3.14159')
    })

    it('should handle Infinity', () => {
      const fn = renderer.compile('${data.val}')
      const result = fn({val: Infinity})
      assert.strictEqual(result, 'Infinity')
    })

    it('should handle -Infinity', () => {
      const fn = renderer.compile('${data.val}')
      const result = fn({val: -Infinity})
      assert.strictEqual(result, '-Infinity')
    })

    it('should handle NaN', () => {
      const fn = renderer.compile('${data.val}')
      const result = fn({val: NaN})
      assert.strictEqual(result, 'NaN')
    })

    it('should handle very large numbers', () => {
      const fn = renderer.compile('${data.val}')
      const result = fn({val: 9007199254740991})
      assert.strictEqual(result, '9007199254740991')
    })

    it('should handle scientific notation', () => {
      const fn = renderer.compile('${data.val}')
      const result = fn({val: 1e10})
      assert.strictEqual(result, '10000000000')
    })
  })

  describe('whitespace handling', () => {
    const renderer = new ZzzTemplateBase()

    it('should preserve leading whitespace', () => {
      const fn = renderer.compile('   text')
      const result = fn({})
      assert.strictEqual(result, '   text')
    })

    it('should preserve trailing whitespace', () => {
      const fn = renderer.compile('text   ')
      const result = fn({})
      assert.strictEqual(result, 'text   ')
    })

    it('should preserve internal whitespace', () => {
      const fn = renderer.compile('word1   word2')
      const result = fn({})
      assert.strictEqual(result, 'word1   word2')
    })

    it('should preserve whitespace around variables', () => {
      const fn = renderer.compile('  ${data.val}  ')
      const result = fn({val: 'x'})
      assert.strictEqual(result, '  x  ')
    })
  })

  describe('INCLUDE with empty template', () => {
    const templates = {
      'main': 'Start${INCLUDE("empty", {})}End',
      'empty': '',
    }

    const renderer = new ZzzTemplateBase()
    renderer.read = (f) => templates[f]
    useInclude(renderer)

    it('should handle empty included template', () => {
      const result = renderer.render('main', {})
      assert.strictEqual(result, 'StartEnd')
    })
  })

  describe('MAP with single item', () => {
    const renderer = new ZzzTemplateBase()
    useIfMap(renderer)

    it('should handle single item array', () => {
      const fn = renderer.compile('${MAP(data.items, "<li>${data}</li>")}')
      const result = fn({items: [42]})
      assert.strictEqual(result, '<li>42</li>')
    })
  })

  describe('boolean in templates', () => {
    const renderer = new ZzzTemplateBase()

    it('should render true as string', () => {
      const fn = renderer.compile('${data.val}')
      const result = fn({val: true})
      assert.strictEqual(result, 'true')
    })

    it('should render false as string', () => {
      const fn = renderer.compile('${data.val}')
      const result = fn({val: false})
      assert.strictEqual(result, 'false')
    })

    it('should use boolean in expressions', () => {
      const fn = renderer.compile('${data.flag ? "yes" : "no"}')
      const result = fn({flag: true})
      assert.strictEqual(result, 'yes')
    })
  })
})
