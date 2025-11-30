import {it, describe} from 'node:test'
import assert from 'node:assert'
import {ZzzTemplateBase, useLayout, useInclude, useLocal, useIfMap, useContentTrim, useFn} from 'zzz-template'  // useInclude kept for standalone usage

describe('Integration Tests', () => {
  describe('all plugins enabled together', () => {
    const templates = {
      'page': '${SET("pageTitle", "Products")}${LAYOUT("layout", {showNav: true})}${MAPI(data.products, "product-card")}',

      'layout': '${INCLUDE("header", {title: local.pageTitle, nav: data.showNav})}${data.content}${INCLUDE("footer", {})}',

      'header': '<header>${IFI(data.nav, "nav", {})}<h1>${data.title}</h1></header>',
      'nav': '<nav>Nav Links</nav>',
      'footer': '<footer>© 2025</footer>',

      'product-card': '<div class="product">${INCLUDE("product-name", data)}${INCLUDE("product-price", data)}</div>',
      'product-name': '<h3>${data.name}</h3>',
      'product-price': '<p>${PRICE(data.price)}</p>',
    }

    const renderer = new ZzzTemplateBase()
    renderer.read = (f) => templates[f]

    useLayout(renderer)  // useLayout includes useInclude
    useLocal(renderer)
    useIfMap(renderer)  // useIfMap includes useInclude
    useContentTrim(renderer)

    function formatPrice(price) {
      return `$${price.toFixed(2)}`
    }
    useFn(renderer, formatPrice, 'PRICE')

    it('should work with all plugins together', () => {
      const result = renderer.render('page', {
        products: [
          {name: 'Product A', price: 19.99},
          {name: 'Product B', price: 29.99}
        ]
      })

      const expected = '<header><nav>Nav Links</nav><h1>Products</h1></header>' +
        '<div class="product"><h3>Product A</h3><p>$19.99</p></div>' +
        '<div class="product"><h3>Product B</h3><p>$29.99</p></div>' +
        '<footer>© 2025</footer>'

      assert.strictEqual(result, expected)
    })
  })

  describe('complex real-world scenario: blog post', () => {
    const templates = {
      'post': `
        \${SET('siteName', 'My Blog')}
        \${SET('author', data.author)}
        \${LAYOUT('blog-layout')}
        <article>
          <h2>\${data.title}</h2>
          <p class="meta">By \${local.author} on \${data.date}</p>
          <div class="content">\${data.content}</div>
          \${IFI(data.tags && data.tags.length > 0, 'tags', data)}
          \${IFI(data.comments && data.comments.length > 0, 'comments', data)}
        </article>
      `,

      'blog-layout': `
        <!DOCTYPE html>
        <html>
          <head><title>\${local.siteName}</title></head>
          <body>
            \${INCLUDE('site-header', {})}
            <main>\${data.content}</main>
            \${INCLUDE('site-footer', {})}
          </body>
        </html>
      `,

      'site-header': '<header><h1>\${local.siteName}</h1></header>',
      'site-footer': '<footer>Powered by zzz-template</footer>',

      'tags': '<div class="tags">Tags: \${MAP(data.tags, "<span>\\${data}</span>")}</div>',

      'comments': `
        <div class="comments">
          <h3>Comments (\${data.comments.length})</h3>
          \${MAPI(data.comments, 'comment')}
        </div>
      `,

      'comment': '<div class="comment"><strong>\${data.author}:</strong> \${data.text}</div>',
    }

    const renderer = new ZzzTemplateBase()
    renderer.read = (f) => templates[f]

    useLayout(renderer)  // useLayout includes useInclude
    useLocal(renderer)
    useIfMap(renderer)  // useIfMap includes useInclude
    useContentTrim(renderer)

    it('should render complete blog post with all features', () => {
      const result = renderer.render('post', {
        title: 'My First Post',
        author: 'Alice',
        date: '2025-10-20',
        content: 'This is the content of my post.',
        tags: ['javascript', 'templates', 'zzz'],
        comments: [
          {author: 'Bob', text: 'Great post!'},
          {author: 'Carol', text: 'Thanks for sharing.'}
        ]
      })

      assert.ok(result.includes('<!DOCTYPE html>'))
      assert.ok(result.includes('<h1>My Blog</h1>'))
      assert.ok(result.includes('<h2>My First Post</h2>'))
      assert.ok(result.includes('By Alice on 2025-10-20'))
      assert.ok(result.includes('<span>javascript</span>'))
      assert.ok(result.includes('<span>templates</span>'))
      assert.ok(result.includes('<span>zzz</span>'))
      assert.ok(result.includes('Comments (2)'))
      assert.ok(result.includes('<strong>Bob:</strong> Great post!'))
      assert.ok(result.includes('<strong>Carol:</strong> Thanks for sharing.'))
      assert.ok(result.includes('Powered by zzz-template'))
    })

    it('should handle post without tags and comments', () => {
      const result = renderer.render('post', {
        title: 'Simple Post',
        author: 'Dave',
        date: '2025-10-21',
        content: 'Just a simple post.',
        tags: [],
        comments: []
      })

      assert.ok(result.includes('<h2>Simple Post</h2>'))
      assert.ok(!result.includes('class="tags"'))
      assert.ok(!result.includes('class="comments"'))
    })
  })

  describe('multiple renders with same instance', () => {
    const templates = {
      'template': 'Hello \${data.name}!',
    }

    const renderer = new ZzzTemplateBase()
    renderer.read = (f) => templates[f]

    it('should handle multiple renders correctly', () => {
      const result1 = renderer.render('template', {name: 'Alice'})
      const result2 = renderer.render('template', {name: 'Bob'})
      const result3 = renderer.render('template', {name: 'Carol'})

      assert.strictEqual(result1, 'Hello Alice!')
      assert.strictEqual(result2, 'Hello Bob!')
      assert.strictEqual(result3, 'Hello Carol!')
    })
  })

  describe('multiple renders with local variables', () => {
    const templates = {
      'template': '\${SET("x", data.value)}Result: \${local.x}',
    }

    const renderer = new ZzzTemplateBase()
    renderer.read = (f) => templates[f]
    useLocal(renderer)

    it('should isolate local variables between renders', () => {
      const result1 = renderer.render('template', {value: 'first'})
      const result2 = renderer.render('template', {value: 'second'})

      assert.strictEqual(result1, 'Result: first')
      assert.strictEqual(result2, 'Result: second')
    })
  })

  describe('reusing compiled functions', () => {
    const renderer = new ZzzTemplateBase()
    const fn = renderer.compile('Hello \${data.name}, you are \${data.age} years old.')

    it('should reuse compiled function multiple times', () => {
      const result1 = fn({name: 'Alice', age: 30})
      const result2 = fn({name: 'Bob', age: 25})
      const result3 = fn({name: 'Carol', age: 35})

      assert.strictEqual(result1, 'Hello Alice, you are 30 years old.')
      assert.strictEqual(result2, 'Hello Bob, you are 25 years old.')
      assert.strictEqual(result3, 'Hello Carol, you are 35 years old.')
    })

    it('should handle different data structures', () => {
      const result1 = fn({name: 'Dave', age: 40})
      const result2 = fn({name: 'Eve'}) // missing age

      assert.strictEqual(result1, 'Hello Dave, you are 40 years old.')
      assert.strictEqual(result2, 'Hello Eve, you are undefined years old.')
    })
  })

  describe('conditional layout based on data', () => {
    const templates = {
      'page': '\${data.isAdmin ? LAYOUT("admin-layout") : LAYOUT("user-layout")}Content',
      'admin-layout': '<admin>\${data.content}</admin>',
      'user-layout': '<user>\${data.content}</user>',
    }

    const renderer = new ZzzTemplateBase()
    renderer.read = (f) => templates[f]
    useLayout(renderer)

    it('should use admin layout for admin', () => {
      const result = renderer.render('page', {isAdmin: true})
      assert.strictEqual(result, '<admin>Content</admin>')
    })

    it('should use user layout for non-admin', () => {
      const result = renderer.render('page', {isAdmin: false})
      assert.strictEqual(result, '<user>Content</user>')
    })
  })

  describe('dynamic template selection', () => {
    const templates = {
      'main': '\${INCLUDE(data.templateName, data.templateData)}',
      'template-a': 'Template A: \${data.value}',
      'template-b': 'Template B: \${data.value}',
      'template-c': 'Template C: \${data.value}',
    }

    const renderer = new ZzzTemplateBase()
    renderer.read = (f) => templates[f]
    useInclude(renderer)

    it('should select template dynamically', () => {
      const result1 = renderer.render('main', {templateName: 'template-a', templateData: {value: 'A'}})
      const result2 = renderer.render('main', {templateName: 'template-b', templateData: {value: 'B'}})
      const result3 = renderer.render('main', {templateName: 'template-c', templateData: {value: 'C'}})

      assert.strictEqual(result1, 'Template A: A')
      assert.strictEqual(result2, 'Template B: B')
      assert.strictEqual(result3, 'Template C: C')
    })
  })

  describe('complex data manipulation', () => {
    const templates = {
      'report': `
        Total Items: \${data.items.length}
        Total Value: \${data.items.reduce((sum, item) => sum + item.price, 0)}
        Average Price: \${(data.items.reduce((sum, item) => sum + item.price, 0) / data.items.length).toFixed(2)}
        Items: \${MAP(data.items, "<div>\${data.name}: $\${data.price}</div>")}
      `,
    }

    const renderer = new ZzzTemplateBase()
    renderer.read = (f) => templates[f]
    useIfMap(renderer)
    useContentTrim(renderer)

    it('should perform complex calculations in templates', () => {
      const result = renderer.render('report', {
        items: [
          {name: 'Item 1', price: 10},
          {name: 'Item 2', price: 20},
          {name: 'Item 3', price: 30}
        ]
      })

      assert.ok(result.includes('Total Items: 3'))
      assert.ok(result.includes('Total Value: 60'))
      assert.ok(result.includes('Average Price: 20.00'))
      assert.ok(result.includes('<div>Item 1: $10</div>'))
    })
  })

  describe('nested layouts with different data at each level', () => {
    const templates = {
      'page': '\${LAYOUT("l1", {level: 1})}Page',
      'l1': '\${LAYOUT("l2", {level: 2})}L1(level=\${data.level}):\${data.content}',
      'l2': '\${LAYOUT("l3", {level: 3})}L2(level=\${data.level}):\${data.content}',
      'l3': 'L3(level=\${data.level}):\${data.content}',
    }

    const renderer = new ZzzTemplateBase()
    renderer.read = (f) => templates[f]
    useLayout(renderer)

    it('should pass different data at each layout level', () => {
      const result = renderer.render('page', {})
      assert.strictEqual(result, 'L3(level=3):L2(level=2):L1(level=1):Page')
    })
  })

  describe('performance: many iterations', () => {
    const renderer = new ZzzTemplateBase()
    useIfMap(renderer)

    it('should handle large arrays efficiently', () => {
      const items = Array.from({length: 1000}, (_, i) => i)
      const fn = renderer.compile('\${MAP(data.items, "<i>\\${data}</i>")}')

      const start = Date.now()
      const result = fn({items})
      const duration = Date.now() - start

      assert.strictEqual(result, items.map(i => `<i>${i}</i>`).join(''))
      assert.ok(duration < 1000, `Took ${duration}ms, expected < 1000ms`)
    })
  })

  describe('combining IF, MAP, INCLUDE, LAYOUT, and LOCAL', () => {
    const templates = {
      'dashboard': `
        \${SET('user', data.currentUser)}
        \${LAYOUT('app-layout')}
        <div class="dashboard">
          \${IFI(data.showWelcome, 'welcome', local)}
          \${IFI(data.items && data.items.length > 0, 'item-list', data)}
          \${IFI(!data.items || data.items.length === 0, 'empty-state', {})}
        </div>
      `,

      'app-layout': '\${INCLUDE("header", local)}<main>\${data.content}</main>',
      'header': '<header>Welcome, \${data.user}!</header>',
      'welcome': '<div class="welcome">Hello \${data.user}!</div>',

      'item-list': '<ul>\${MAPI(data.items, "item")}</ul>',
      'item': '<li>\${data.important ? `<b>${data.name}</b>` : data.name}</li>',

      'empty-state': '<div class="empty">No items to display</div>',
    }

    const renderer = new ZzzTemplateBase()
    renderer.read = (f) => templates[f]
    useLayout(renderer)  // useLayout includes useInclude
    useLocal(renderer)
    useIfMap(renderer)  // useIfMap includes useInclude

    it('should render dashboard with items', () => {
      const result = renderer.render('dashboard', {
        currentUser: 'Alice',
        showWelcome: true,
        items: [
          {name: 'Task 1', important: true},
          {name: 'Task 2', important: false},
          {name: 'Task 3', important: true}
        ]
      })

      assert.ok(result.includes('Welcome, Alice!'))
      assert.ok(result.includes('Hello Alice!'))
      assert.ok(result.includes('<b>Task 1</b>'))
      assert.ok(result.includes('<li>Task 2</li>'))
      assert.ok(result.includes('<b>Task 3</b>'))
      assert.ok(!result.includes('No items'))
    })

    it('should render dashboard with empty state', () => {
      const result = renderer.render('dashboard', {
        currentUser: 'Bob',
        showWelcome: false,
        items: []
      })

      assert.ok(result.includes('Welcome, Bob!'))
      assert.ok(!result.includes('Hello Bob!'))
      assert.ok(result.includes('No items to display'))
      assert.ok(!result.includes('<ul>'))
    })
  })
})
