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
zzz.s.push('let $$$ = data;') // introduce `$$$` for `data`
// zzz.e -- e means end (after template content compiled)
zzz.e.push('content = content.trim();')
const fn = zzz.compile(' Hello ${$$$.name} ') // we use new name `$$$` for `data`
const result = fn({name: 'Tom'})
console.log(result); // > "Hello Tom"
```

$${EXAMPLE('Example that introduces `ESCAPE` function that escapes string', 'examples/10-extend/escape.html')}