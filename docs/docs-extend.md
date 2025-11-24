## Extend and hack
ZzzTemplate already has a few built-in plugins. A plugin is just a function that monkey-patches the ZzzTemplate instance.
For instance, you can inject your code into the compile function. Here is a 'trim' example:

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
This function pushes a code snippet to the end array that will be invoked after the template content is compiled. 


Or you may want to introduce a new var in your templates.

``` javascript
import {ZzzBrowser, useContentTrim} from "zzz-template"

const zzz = new ZzzBrowser()

// zzz.s -- s means start (before template content compiled)
zzz.s.push('let $$$ = data;') // introduce `$$$` for `data`
// zzz.e -- e means end (after template content compiled)
zzz.e.push('content = content.trim();')
const fn = zzz.compile(' Hello ${$$$.name} ') // we use new name `$$$` for `data`
const result = fn({name: 'Tom'})
console.log(result); // > "Hello Tom"
```

$${EXAMPLE('Example that introduces `ESCAPE` function that escapes string', 'examples/10-extend/escape.html')}