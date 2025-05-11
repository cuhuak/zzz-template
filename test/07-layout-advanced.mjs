import {it, describe} from 'node:test'
import assert from 'node:assert'
import {ZzzBase, useLayout, useLocal, useIfMap, useContentTrim} from 'zzz-template'

describe('Advanced Layout Tests', () => {
  describe('nested layouts (layout → layout → layout)', () => {
    const templates = {
      'page': '${LAYOUT("layout1")}Page Content',
      'layout1': '${LAYOUT("layout2")}<div class="layout1">${data.content}</div>',
      'layout2': '${LAYOUT("layout3")}<div class="layout2">${data.content}</div>',
      'layout3': '<div class="layout3">${data.content}</div>',
    }

    const renderer = new ZzzBase()
    renderer.read = (f) => templates[f]
    useLayout(renderer)

    it('should support 3 levels of nested layouts', () => {
      const result = renderer.render('page', {})
      assert.strictEqual(
        result,
        '<div class="layout3"><div class="layout2"><div class="layout1">Page Content</div></div></div>'
      )
    })
  })

  describe('layout with INCLUDE', () => {
    const templates = {
      'page': '${LAYOUT("layout")}Page Content',
      'layout': '${INCLUDE("header", {})}${data.content}${INCLUDE("footer", {})}',
      'header': '<header>Header</header>',
      'footer': '<footer>Footer</footer>',
    }

    const renderer = new ZzzBase()
    renderer.read = (f) => templates[f]
    useLayout(renderer)  // useLayout includes useInclude internally

    it('should allow layouts to include other templates', () => {
      const result = renderer.render('page', {})
      assert.strictEqual(result, '<header>Header</header>Page Content<footer>Footer</footer>')
    })
  })

  describe('layout with IF/MAP', () => {
    const templates = {
      'page': '${LAYOUT("layout", {showNav: true, items: [1, 2, 3]})}Page Content',
      'layout': '${IFI(data.showNav, "nav", {})}${data.content}${MAP(data.items, "<span>\\${data}</span>")}',
      'nav': '<nav>Navigation</nav>',
    }

    const renderer = new ZzzBase()
    renderer.read = (f) => templates[f]
    useLayout(renderer)
    useIfMap(renderer)

    it('should support IF and MAP in layouts', () => {
      const result = renderer.render('page', {})
      assert.strictEqual(result, '<nav>Navigation</nav>Page Content<span>1</span><span>2</span><span>3</span>')
    })

    it('should skip conditional content when false', () => {
      const templates2 = {
        'page': '${LAYOUT("layout", {showNav: false, items: []})}Page Content',
        'layout': '${IFI(data.showNav, "nav", {})}${data.content}${MAP(data.items, "<span>\\${data}</span>")}',
        'nav': '<nav>Navigation</nav>',
      }
      const renderer2 = new ZzzBase()
      renderer2.read = (f) => templates2[f]
      useLayout(renderer2)
      useIfMap(renderer2)

      const result = renderer2.render('page', {})
      assert.strictEqual(result, 'Page Content')
    })
  })

  describe('layout with local variables', () => {
    const templates = {
      'page': '${SET("pageTitle", "My Page")}${LAYOUT("layout")}Page Content',
      'layout': '<h1>${local.pageTitle}</h1>${data.content}',
    }

    const renderer = new ZzzBase()
    renderer.read = (f) => templates[f]
    useLayout(renderer)
    useLocal(renderer)

    it('should access local variables in layout', () => {
      const result = renderer.render('page', {})
      assert.strictEqual(result, '<h1>My Page</h1>Page Content')
    })
  })

  describe('multiple layout changes in single render', () => {
    const templates = {
      'page': '${LAYOUT("layout1")}${LAYOUT("layout2")}Page Content',
      'layout1': '<div class="layout1">${data.content}</div>',
      'layout2': '<div class="layout2">${data.content}</div>',
    }

    const renderer = new ZzzBase()
    renderer.read = (f) => templates[f]
    useLayout(renderer)

    it('should use the last LAYOUT call', () => {
      const result = renderer.render('page', {})
      assert.strictEqual(result, '<div class="layout2">Page Content</div>')
    })
  })

  describe('layout without data parameter', () => {
    const templates = {
      'page': '${LAYOUT("layout")}Page Content',
      'layout': '<main>${data.content}</main>',
    }

    const renderer = new ZzzBase()
    renderer.read = (f) => templates[f]
    useLayout(renderer)

    it('should work when no data passed to LAYOUT', () => {
      const result = renderer.render('page', {})
      assert.strictEqual(result, '<main>Page Content</main>')
    })
  })

  describe('layout with data parameter', () => {
    const templates = {
      'page': '${LAYOUT("layout", {title: "Custom Title", nav: true})}Page Content',
      'layout': '<h1>${data.title}</h1>${data.nav ? "<nav>Nav</nav>" : ""}${data.content}',
    }

    const renderer = new ZzzBase()
    renderer.read = (f) => templates[f]
    useLayout(renderer)

    it('should pass data to layout', () => {
      const result = renderer.render('page', {})
      assert.strictEqual(result, '<h1>Custom Title</h1><nav>Nav</nav>Page Content')
    })
  })

  describe('layout with trim', () => {
    const templates = {
      'page': ' ${LAYOUT("layout")} Page Content ',
      'layout': ' <main>${data.content}</main> ',
    }

    const renderer = new ZzzBase()
    renderer.read = (f) => templates[f]
    useLayout(renderer)
    useContentTrim(renderer)

    it('should trim the final result', () => {
      const result = renderer.render('page', {})
      // useContentTrim only trims the outer result, not content within templates
      assert.strictEqual(result, '<main>  Page Content </main>')
    })
  })

  describe('layout preserves page data', () => {
    const templates = {
      'page': '${LAYOUT("layout", {layoutData: "from layout"})}Page: ${data.pageData}',
      'layout': 'Layout: ${data.layoutData} | ${data.content}',
    }

    const renderer = new ZzzBase()
    renderer.read = (f) => templates[f]
    useLayout(renderer)

    it('should preserve original page data', () => {
      const result = renderer.render('page', {pageData: 'from page'})
      assert.strictEqual(result, 'Layout: from layout | Page: from page')
    })
  })

  describe('layout with complex nesting and local vars', () => {
    const templates = {
      'page': '${SET("x", 1)}${LAYOUT("l1")}${SET("y", 2)}Page',
      'l1': '${SET("z", 3)}${LAYOUT("l2")}L1-${local.x}-${local.y}-${local.z}-${data.content}',
      'l2': 'L2-${local.x}-${local.y}-${local.z}-${data.content}',
    }

    const renderer = new ZzzBase()
    renderer.read = (f) => templates[f]
    useLayout(renderer)
    useLocal(renderer)

    it('should handle complex nesting with local variables', () => {
      const result = renderer.render('page', {})
      assert.strictEqual(result, 'L2-1-2-3-L1-1-2-3-Page')
    })
  })

  describe('layout with INCLUDE and nested data', () => {
    const templates = {
      'page': '${LAYOUT("layout", {user: {name: "Alice"}})}Content',
      'layout': '${INCLUDE("user-info", data.user)}${data.content}',
      'user-info': '<span>User: ${data.name}</span>',
    }

    const renderer = new ZzzBase()
    renderer.read = (f) => templates[f]
    useLayout(renderer)  // useLayout includes useInclude internally

    it('should pass nested data through layout to include', () => {
      const result = renderer.render('page', {})
      assert.strictEqual(result, '<span>User: Alice</span>Content')
    })
  })

  describe('conditional layout', () => {
    const templates = {
      'page': '${data.useLayout && LAYOUT("layout")}Content',
      'layout': '<div>${data.content}</div>',
    }

    const renderer = new ZzzBase()
    renderer.read = (f) => templates[f]
    useLayout(renderer)

    it('should apply layout when condition is true', () => {
      const result = renderer.render('page', {useLayout: true})
      assert.strictEqual(result, '<div>Content</div>')
    })

    it('should not apply layout when condition is false', () => {
      const result = renderer.render('page', {useLayout: false})
      assert.strictEqual(result, 'falseContent')
    })
  })

  describe('layout returns empty string', () => {
    const templates = {
      'page': 'Before${LAYOUT("layout")}After',
      'layout': '<div>${data.content}</div>',
    }

    const renderer = new ZzzBase()
    renderer.read = (f) => templates[f]
    useLayout(renderer)

    it('should show that LAYOUT function returns empty string', () => {
      const result = renderer.render('page', {})
      assert.strictEqual(result, '<div>BeforeAfter</div>')
    })
  })
})
