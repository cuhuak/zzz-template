
## Layouts
* `useLayout(zzz)` to enable layouts feature
* `${LAYOUT('layout', {name: 'universe'})}` to set layout in `template` (`${LAYOUT(...)}` is the same)
* `${data.content}` to echo content (result of `template`) in layout `layout`

$${EXAMPLE('Example Layout', 'examples/06-layout/layouts.html')}

Layout template itself can set global layout, and global layout can set more global layout, etc.
See example how layout can include each other: `examples/06-layout/layouts2.html`. Please note the example also uses local vars feature.

$${EXAMPLE('Example Layout Advanced', 'examples/06-layout/layouts2.html')}
