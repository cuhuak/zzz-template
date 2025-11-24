# zzz-template

> The fastest, simplest JavaScript template engine with zero dependencies

[![npm version](https://img.shields.io/npm/v/zzz-template.svg)](https://www.npmjs.com/package/zzz-template)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/zzz-template)](https://bundlephobia.com/package/zzz-template)
[![license](https://img.shields.io/npm/l/zzz-template.svg)](https://github.com/cuhuak/zzz-template/blob/main/LICENSE)

**zzz-template** is an ultra-lightweight JavaScript template engine that leverages native template literals for maximum performance. A fast, hackable alternative to EJS, Handlebars, and Mustache that works in both Node.js and browsers.

## Why zzz-template?

| Feature | zzz-template | EJS | Handlebars |
|---------|-------------|-----|------------|
| Size (min+gzip) | ~500 bytes | ~6KB | ~17KB |
| Dependencies | 0 | 1 | 0 |
| Performance | 24M ops/sec | 247K ops/sec | - |
| Browser + Node.js | Yes | Yes | Yes |
| Template Literals | Native | No | No |

## Features

- **Echo variables**: `${data.user.name}`
- **Layouts**: Set layout in child template `${LAYOUT("layout.html")}`, echo content `${data.content}` in `layout.html`
- **Include (partial) templates**: `${INCLUDE('partial.html', data)}`
- **Local variables**: `${SET('title', 'Hello world')}`, then use it in template: `${local.title}`
- **Blazing fast**: Matches vanilla JavaScript performance (24M ops/sec)
- **Zero dependencies**: No bloat, no supply chain risk
- **Tiny footprint**: ~50 lines of code, ~500 bytes minified + gzipped
- **Hackable**: Easy to extend with plugins
- **Isomorphic**: Works on server (Node.js) and browser

## Installation

```bash
npm install zzz-template
```

### Compile example (see [examples/00-compile](examples/00-compile))
``` javascript
// file examples/00-compile/example.js
import {ZzzBrowser} from "zzz-template"

const zzz = new ZzzBrowser()
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
  import { ZzzBrowser } from '/zzz-template/index.js'

  const zzz = new ZzzBrowser()

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
import { ZzzFs } from 'zzz-template/fs.js'

const zzz = new ZzzFs({ dir: import.meta.dirname })
const result = zzz.render('template.html', { name: 'Jerry' })
console.log(result)
// OUTPUT:
// <p>
//   Hello Jerry
// </p>
```

## Include (partial)
* `useInclude(zzz)` to enable include feature
* `${INCLUDE('partial', {name: 'universe'})}` to include `partial` template

### Example include (browser) (see [examples/03-include](examples/03-include))
``` html
<!-- file examples/03-include/page.html --> 
<script type="module">
  import { ZzzBrowser, useInclude } from '/zzz-template/index.js'

  const zzz = new ZzzBrowser()
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
  import { ZzzBrowser, useLayout } from '/zzz-template/index.js'

  const zzz = new ZzzBrowser()
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
  import { ZzzBrowser, useLayout, useLocal } from '/zzz-template/index.js'

  const zzz = new ZzzBrowser()
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
  import { ZzzBrowser, useIfMap } from '/zzz-template/index.js'

  const zzz = new ZzzBrowser()
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
  import { ZzzBrowser, useIfMap } from '/zzz-template/index.js'

  const zzz = new ZzzBrowser()
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
  import { ZzzBrowser, useIfMap } from '/zzz-template/index.js'

  const zzz = new ZzzBrowser()
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
ZzzTemplate already has a few built-in plugins. Plugin is just a function that monkey patch ZzzTemplate instance.
For instance, you can inject your code into compile function. Here is 'trim' example:

``` javascript
import {ZzzBrowser, useContentTrim} from "zzz-template"

const zzz = new ZzzBrowser()
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
This function just pushes code-snippet to the end array that will be invoked after template content compiled. 


Or you may want to introduce new var in your templates.

``` javascript
import {ZzzBrowser, useContentTrim} from "zzz-template"

const zzz = new ZzzBrowser()

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
  import { ZzzBrowser, useFn } from '/zzz-template/index.js'

  const zzz = new ZzzBrowser()

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

## Fast

Fastest JS engine ever :) That is true, see the benchmark results (ran on old author's intel i7):

```
--------- Benchmark Render ---------
vanilla render x 24,478,910 ops/sec ±1.23% (91 runs sampled)
zzz render x 24,256,470 ops/sec ±1.25% (90 runs sampled)
literal render x 16,843,920 ops/sec ±1.63% (89 runs sampled)
zup render x 2,738,409 ops/sec ±1.43% (91 runs sampled)
ejs render x 247,632 ops/sec ±2.10% (91 runs sampled)
dot render x 1,096,741 ops/sec ±0.58% (93 runs sampled)
edge render x 8,037 ops/sec ±1.80% (90 runs sampled)
Fastest is vanilla render, zzz render
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
Do not render templates (by filename) that comes from user input, and values in templates that comes from user input, it is danger.
And if you do, please make sure you:
- provide a secure `zzz.read` function, that reads files from specified dir, and not `../../../secret.passwords`
- escape all user inputs to prevent XSS attacks

## Licence
MIT

## Related

Looking for JavaScript template engines? Here are some alternatives:
- [EJS](https://www.npmjs.com/package/ejs) - Embedded JavaScript templates
- [Handlebars](https://www.npmjs.com/package/handlebars) - Semantic templates
- [Mustache](https://www.npmjs.com/package/mustache) - Logic-less templates
- [doT](https://www.npmjs.com/package/dot) - Fast template engine

---
Docs revision: 2025-11-23T20:04:26.847Z