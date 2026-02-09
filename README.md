# zzz-template

> The fastest, simplest JavaScript template engine with zero dependencies

[![npm version](https://img.shields.io/npm/v/zzz-template.svg)](https://www.npmjs.com/package/zzz-template)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/zzz-template)](https://bundlephobia.com/package/zzz-template)
[![license](https://img.shields.io/npm/l/zzz-template.svg)](https://github.com/cuhuak/zzz-template/blob/main/LICENSE)

**zzz-template** is an ultra-lightweight JavaScript template engine that leverages native template literals for maximum performance. 
A fast, hackable alternative to EJS, Handlebars, and Mustache that works in both Node.js and browsers.

## Features

- **Echo variables**: `${data.user.name}`
- **Layouts**: Set layout in child template `${LAYOUT("layout.html")}`, echo content `${data.content}` in `layout.html`
- **Include (partial) templates**: `${INCLUDE('partial.html', data)}`
- **Local variables**: `${SET('title', 'Hello world')}`, then use it in template: `${local.title}`
- **Blazing fast**: Matches vanilla JavaScript performance (24M ops/sec)
- **Zero dependencies**: No bloat, no supply chain risk
- **Tiny footprint**: ~50 lines of code, ~600 bytes minified + gzipped
- **Hackable**: Easy to extend with plugins
- **Isomorphic**: Works on server (Node.js) and browser

## Installation

```bash
npm install zzz-template
```

### Compile example (see [examples/00-compile](examples/00-compile))
``` javascript
// file examples/00-compile/example.js
import {ZzzTemplate} from "zzz-template"

const zzz = new ZzzTemplate()
const fn = zzz.compile('Hello ${data.name}') // returns function that renders your template using data: `fn(data)`
console.log(fn({name: 'Jerry'})); // > "Hello Jerry"
console.log(fn({name: 'Tom'})); // > "Hello Tom"
```

### Basic example (browser), render `<script>` template (see [examples/01-basic](examples/01-basic))
``` html
<!-- file examples/01-basic/page.html --> 
<script id="template" type="plain/text">
  <p>
    Hello ${data.name}
  </p>
</script>

<script type="module">
  import { ZzzTemplate } from '/zzz-template/index.js'

  const zzz = new ZzzTemplate()

  const result = zzz.render('template', { name: 'world' })

  console.log(result)

  document.body.innerHTML = result
</script>
```

### Basic example (server), render `file` template (see [examples/02-basic](examples/02-basic))
``` html
<!-- file examples/02-basic/template.html --> 
<p>
  Hello ${data.name}
</p>
```
``` javascript
// file examples/02-basic/example.js
import { ZzzTemplateNode } from 'zzz-template/node.js'

const zzz = new ZzzTemplateNode({ dir: import.meta.dirname })
const result = zzz.render('template.html', { name: 'Jerry' })
console.log(result)
// OUTPUT:
// <p>
//   Hello Jerry
// </p>
```

### All features in one example (see [examples/99-all-features](examples/99-all-features))
``` html
<!-- file examples/99-all-features/all.html --> 
<script type="module">
  import { ZzzTemplate, useLayout, useLocal, useIfMap, useFn } from '/zzz-template/index.js'

  const zzz = new ZzzTemplate()

  useLayout(zzz) // LAYOUT, INCLUDE
  useLocal(zzz)  // SET, SETA, local
  useIfMap(zzz)  // IF, IFI, MAP, MAPI, TEMPLATE
  useFn(zzz, str => str.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;'), 'ESCAPE') // custom ESCAPE function

  // Render
  const result = zzz.render('page', {
    title: 'All Features Demo',
    user: { name: 'Alice', role: 'admin' },
    pets: [
      { name: 'Cat', say: 'meow' },
      { name: 'Dog', say: 'woof' }
    ],
    html: '<b>bold</b>'
  })

  document.body.innerHTML = result
</script>

<!-- Main page template -->
<script id="page" type="plain/text">
  ${LAYOUT('layout', {title: data.title})}
  ${SET('year', 2024)}

  <h2>Hello ${data.user.name}!</h2>

  <!-- IF: conditional inline template -->
  ${IF(data.user.role === 'admin', '<p>You have admin access.</p>')}

  <!-- IFI: conditional include template -->
  ${IFI(data.user.role === 'admin', 'admin-badge', data.user)}

  <!-- Custom function: escape HTML -->
  <p>Escaped: ${ESCAPE(data.html)}</p>

  <!-- MAP: loop with inline template -->
  <ul>
    ${MAP(data.pets, '<li>${data.name} says ${data.say}</li>')}
  </ul>

  <!-- MAPI: loop with include template -->
  <ul>
    ${MAPI(data.pets, 'pet')}
  </ul>

  <!-- INCLUDE: partial template -->
  ${INCLUDE('footer', {text: 'Thanks for visiting!'})}
</script>

<!-- Layout template -->
<script id="layout" type="plain/text">
  <html>
  <head><title>${data.title}</title></head>
  <body>
    <header>${data.title} - ${local.year}</header>
    ${data.content}
  </body>
  </html>
</script>

<!-- Partial templates -->
<script id="footer" type="plain/text">
  <footer>${data.text}</footer>
</script>

<script id="admin-badge" type="plain/text">
  <span style="color:red">[Admin: ${data.name}]</span>
</script>

<script id="pet" type="plain/text">
  <li>${data.name} says "${data.say}"</li>
</script>
```

## Include (partial)
* `useInclude(zzz)` to enable include feature
* `${INCLUDE('partial', {name: 'universe'})}` to include `partial` template

### Example include (browser) (see [examples/03-include](examples/03-include))
``` html
<!-- file examples/03-include/page.html --> 
<script type="module">
  import { ZzzTemplate, useInclude } from '/zzz-template/index.js'

  const zzz = new ZzzTemplate()
  useInclude(zzz) // 👈 enables include feature

  const result = zzz.render('template', { name: 'world' })

  document.body.innerHTML = result
</script>

<script id="template" type="plain/text">
  <p>
    Hello ${data.name}!
  </p>

  ${INCLUDE('partial', {name: 'universe'})}
</script>

<script id="partial" type="plain/text">
  <p>
    Hey ${data.name}!
  </p>
</script>
```

## Layouts
* `useLayout(zzz)` to enable layouts feature
* `${LAYOUT('layout', {name: 'universe'})}` to set layout in `template`
* `${data.content}` to echo content (result of `template`) in layout `layout`

### Example Layout (see [examples/06-layout](examples/06-layout))
``` html
<!-- file examples/06-layout/layouts.html --> 
<script type="module">
  import { ZzzTemplate, useLayout } from '/zzz-template/index.js'

  const zzz = new ZzzTemplate()
  useLayout(zzz) // 👈 enables layout feature

  const result = zzz.render('template', { name: 'world' })

  document.body.innerHTML = result
</script>

<script id="template" type="plain/text">
  ${LAYOUT('layout', {name: 'universe'})}
  <p>
    Hello ${data.name}!
  </p>
</script>

<script id="layout" type="plain/text">
  Hey ${data.name}!
  <div>
    ${data.content}
  </div>
</script>
```

Layout template itself can set global layout, and global layout can set more global layout, etc.
See example how layout can include each other: `examples/06-layout/layouts2.html`. Please note the example also uses local vars feature.

### Example Layout Advanced (see [examples/06-layout](examples/06-layout))
``` html
<!-- file examples/06-layout/layouts2.html --> 
<script id="template" type="plain/text">
  ${LAYOUT('layout')}
  ${SET('title', 'My page')}
  <p>
    Hello ${data.name}
  </p>
</script>

<script id="layout" type="plain/text">
  ${LAYOUT('global')}
  <div style="background: #eee; padding: 1em; margin: 1em 0;">
    <div>layout begin</div>
    <section class="layout">
    ${data.content}
    </section>
    <div>layout end</div>
  </div>
</script>

<script id="global" type="plain/text">
  <div style="background: #ffb; padding: 1em;">
    <nav>
      <a href="#">link1</a>
      <a href="#">link2</a>
      <a href="#">link3</a>
    </nav>
    <h1>${local.title}</h1>
    ${data.content}
    <footer>Footer</footer>
  </div>
</script>

<script type="module">
  import { ZzzTemplate, useLayout, useLocal } from '/zzz-template/index.js'

  const zzz = new ZzzTemplate()
  useLayout(zzz) // 👈 enables layout feature
  useLocal(zzz) // 👈 enables local vars feature

  const result = zzz.render('template', { name: 'world' })

  console.log(result)

  document.body.innerHTML = result
</script>
```

## Conditions IF
* `useIfMap(zzz)` to enable "if, each" feature
* `${IF(data.n === 42, 'Hello ${data.name}!', {name: 'world'})}` to echo string on condition
* you may want to pass data into template

### Example Condition IF (see [examples/04-if](examples/04-if))
``` html
<!-- file examples/04-if/if.html --> 
<script type="module">
  import { ZzzTemplate, useIfMap } from '/zzz-template/index.js'

  const zzz = new ZzzTemplate()
  useIfMap(zzz) // 👈 enables "if/map" feature

  const result = zzz.render('template', { name: 'world', n: 42 })

  document.body.innerHTML = result
</script>

<script id="template" type="plain/text">
  <p>
    Hello ${data.name}!
  </p>

  ${IF(data.n === 42, 'Hello ${data.n}!', {n: data.n})}

  <hr>

  ${IF(data.n === 42, `
    Hello ${data.n}! <br>
    ${IF(data.n % 2 === 0, `
      doubled ${data.n} is \${data.number}.
    `, {number: data.n * 2})}
  `)}
</script>
```

## Conditions IFI
* `useIfMap(zzz)` to enable "if, each" feature
* `${IFI(condition, 'template', data)}`: if `condition` then include `template` with `data`
* do not forget to pass data

### Example Condition IFI: `if (condition) include` (see [examples/04-if](examples/04-if))
``` html
<!-- file examples/04-if/ifi.html --> 
<script type="module">
  import { ZzzTemplate, useIfMap } from '/zzz-template/index.js'

  const zzz = new ZzzTemplate()
  useIfMap(zzz) // 👈 enables "if/map" feature

  const result = zzz.render('template', { name: 'world', n: 42 })

  document.body.innerHTML = result
</script>

<script id="template" type="plain/text">
  <p>
    Hello ${data.name}!
  </p>

  ${IFI(data.n % 2 == 0, 'partial', {n: data.n})}
</script>

<script id="partial" type="plain/text">
  <p>
    ${data.n} is even!
  </p>
</script>
```

## Iterate, loop, map, for (include template for elements)
* `useIfMap(zzz)` to enable "if, each" feature
* `${MAP('template string', elements)}`: for each el in elements render `template string` w/ el as data

### Example MAP (see [examples/05-map](examples/05-map))
``` html
<!-- file examples/05-map/map.html --> 
<script type="module">
  import { ZzzTemplate, useIfMap } from '/zzz-template/index.js'

  const zzz = new ZzzTemplate()
  useIfMap(zzz) // 👈 enables "if/map" feature

  const pets = [{ name: 'cat', say: 'meow' }, { name: 'dog', say: 'woof' }]
  const result = zzz.render('template', { name: 'John Doe', pets })

  document.body.innerHTML = result
</script>

<script id="template" type="plain/text">
  // [1] using javascript .map
  <ul>
    ${data.pets.map(x => TEMPLATE('<li>${data.name}</li>', x)).join('')}
  </ul>
  // [2] using MAP and string
  <ul>
    ${MAP(data.pets, '<li>${data.name}</li>')}
  </ul>
  // [2'] using MAP and string template (note that dollar-sign ($) is escaped)
  <ul>
    ${MAP(data.pets, `<li>\${data.name}</li>`)}
  </ul>
  // [3] using MAPI (map include) to include template for each element
  <ul>
    ${MAPI(data.pets, 'pet')}
  </ul>
</script>

<script id="pet" type="plain/text">
  <li>${data.name} (says: ${data.say})</li>
</script>
```

## Extend and hack
ZzzTemplate already has a few built-in plugins. A plugin is just a function that monkey-patches the ZzzTemplate instance.
For instance, you can inject your code into the compile function. Here is a 'trim' example:

``` javascript
import {ZzzTemplate, useContentTrim} from "zzz-template"

const zzz = new ZzzTemplate()
useContentTrim(zzz)
const fn = zzz.compile('   Hello ${data.name}   ')
// note that result is trimmed
const result = fn({name: 'Tom'})
console.log(result); // > "Hello Tom"
```
Here is the code of `useContentTrim` (built-in)
``` javascript
function useContentTrim(zzz) {
  zzz.e.push('content = content.trim();')
}
```
This function pushes a code snippet to the end (`e`) array that will be invoked after the template content is compiled. 


Or you may want to introduce a new var in your templates.

``` javascript
import {ZzzTemplate, useContentTrim} from "zzz-template"

const zzz = new ZzzTemplate()

// zzz.s -- s means start (before template content compiled)
zzz.s.push('let $$ = data;') // introduce `$$` for `data`
// zzz.e -- e means end (after template content compiled)
zzz.e.push('content = content.trim();')
const fn = zzz.compile(' Hello ${$$.name} ') // we use new name `$$` for `data`
const result = fn({name: 'Tom'})
console.log(result); // > "Hello Tom"
```

### Example that introduces `ESCAPE` function that escapes string (see [examples/10-extend](examples/10-extend))
``` html
<!-- file examples/10-extend/escape.html --> 
<script type="module">
  import { ZzzTemplate, useFn } from '/zzz-template/index.js'

  const zzz = new ZzzTemplate()

  function escapeHtml (unsafe) {
    return unsafe
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;")
  }

  useFn(zzz, escapeHtml, 'ESCAPE')
  const evilString = 'John<img src="" onerror=alert("Boo!")>'

  const result = zzz.render('template', { name: evilString })

  console.log(result)
  document.body.innerHTML = result
</script>

<script id="template" type="plain/text">
  <p>
    Hello ${ESCAPE(data.name)}!
  </p>
</script>
```

### Example using `with` statement to avoid `data.` prefix (see [examples/10-extend](examples/10-extend))
``` html
<!-- file examples/10-extend/with.html --> 
<!-- useWith: use ${name} instead of ${data.name} -->
<script type="module">
  import { ZzzTemplate, useLayout } from '/zzz-template/index.js'

  // wraps template in with(data){...} so you can use ${name} instead of ${data.name}
  function useWith(zzz) {
    zzz.s.unshift('with(data){')
    zzz.e.push('return content}')
  }

  const zzz = new ZzzTemplate()
  useLayout(zzz)
  useWith(zzz) // MUST BE LAST

  const result = zzz.render('page', { title: 'My Page', name: 'Jerry' })

  document.body.innerHTML = result
</script>

<script id="page" type="plain/text">
  ${LAYOUT('layout', {title})}
  <p>Hello ${name}!</p>
</script>

<script id="layout" type="plain/text">
  <h1>${title}</h1>
  ${content}
</script>
```

## Fast

Fastest JS engine ever :) That is true, see the benchmark results (ran on the author's old Intel i7):

```
--------- Benchmark Render ---------
vanilla render x 25,887,906 ops/sec ±1.96% (90 runs sampled)
zzz render x 26,094,676 ops/sec ±2.12% (89 runs sampled)
literal render x 18,892,337 ops/sec ±1.50% (90 runs sampled)
zup render x 3,288,075 ops/sec ±1.15% (92 runs sampled)
ejs render x 272,557 ops/sec ±1.12% (93 runs sampled)
dot render x 1,121,797 ops/sec ±1.48% (88 runs sampled)
edge render x 8,030 ops/sec ±1.99% (87 runs sampled)
handlebars render x 146,572 ops/sec ±1.29% (92 runs sampled)
Fastest is zzz render, vanilla render
```

Try to run benchmarks
```
# go to bench 
cd bench

# install deps
npm i

# run
npm run bench
```

## Security
Do not render templates (by filename) that come from user input, or values in templates that come from user input—it is dangerous.
And if you do, please make sure you:
- provide a secure `zzz.read` function that reads files from a specified directory, not `../../../secret.passwords`
- escape all user input to prevent XSS attacks

## Why zzz-template?

| Feature | zzz-template | EJS | Handlebars | doT | zup |
|---------|--------------|-----|------------|-----|-----|
| Size (min+gzip) | ~600 bytes | ~6KB | ~17KB | ~2KB | ~1KB |
| Dependencies | 0 | 1 | 0 | 0 | 0 |
| Performance | 26M ops/sec | 273K ops/sec | 147K ops/sec | 1.1M ops/sec | 3.3M ops/sec |
| Browser + Node.js | Yes | Yes | Yes | Yes | Yes |
| Template Literals | Native | No | No | No | No |

## License
MIT

## Related

Looking for JavaScript template engines? Here are some alternatives:
- [EJS](https://www.npmjs.com/package/ejs) - Embedded JavaScript templates
- [Handlebars](https://www.npmjs.com/package/handlebars) - Semantic templates
- [Mustache](https://www.npmjs.com/package/mustache) - Logic-less templates
- [doT](https://www.npmjs.com/package/dot) - Fast template engine

---
Docs revision: 2026-02-09T09:00:36.891Z