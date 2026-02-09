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
