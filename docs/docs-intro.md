# zzz-template

> The fastest, simplest JavaScript template engine with zero dependencies

[![npm version](https://img.shields.io/npm/v/zzz-template.svg)](https://www.npmjs.com/package/zzz-template)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/zzz-template)](https://bundlephobia.com/package/zzz-template)
[![license](https://img.shields.io/npm/l/zzz-template.svg)](https://github.com/cuhuak/zzz-template/blob/main/LICENSE)

**zzz-template** is an ultra-lightweight JavaScript template engine that leverages native template literals for maximum performance.
A fast, hackable alternative to EJS, Handlebars, and Mustache that works in both Node.js and browsers.

## Features

- **Echo var**: `${data.user.name}`
- **Include template**: `${INCLUDE('template.html', data)}`
- **Local vars**: `${SET('title', 'Hello world')}`, then use it in any template (layouts, partials): `${local.title}`
- **Conditionals**: `${IF(data.isAdmin, '<b>Admin</b>', data)}` or `${IFI(data.isAdmin, 'template.html', data)}`
- **Iteration**: `${MAP(data.items, '<li>${data.name}</li>')}` or `${MAPI(data.items, 'item.html')}`
- **Layouts**: `${LAYOUT("layout.html")}` sets layout, `${data.content}` echoes content in `layout.html`
- **Blazing fast**: Matches vanilla JavaScript performance (24M ops/sec)
- **Tiny & zero dependencies**: ~50 lines of code, ~600 bytes min+gzip
- **Hackable**: Easy to extend with plugins (see [`with` example](examples/10-extend) to use `${name}` instead of `${data.name}`)
- **Isomorphic**: Works on server (Node.js) and browser

## Installation

```bash
npm install zzz-template
```

> ⭐ If you find this lib useful, please do not hesitate to star it on [GitHub](https://github.com/cuhuak/zzz-template) :)