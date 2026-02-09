# zzz-template

> The fastest, simplest JavaScript template engine with zero dependencies

[![npm version](https://img.shields.io/npm/v/zzz-template.svg)](https://www.npmjs.com/package/zzz-template)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/zzz-template)](https://bundlephobia.com/package/zzz-template)
[![license](https://img.shields.io/npm/l/zzz-template.svg)](https://github.com/cuhuak/zzz-template/blob/main/LICENSE)

**zzz-template** is an ultra-lightweight JavaScript template engine that leverages native template literals for maximum performance. A fast, hackable alternative to EJS, Handlebars, and Mustache that works in both Node.js and browsers.

## Why zzz-template?

| Feature | zzz-template | EJS | Handlebars | doT | zup |
|---------|--------------|-----|------------|-----|-----|
| Size (min+gzip) | ~600 bytes | ~6KB | ~17KB | ~2KB | ~1KB |
| Dependencies | 0 | 1 | 0 | 0 | 0 |
| Performance | 26M ops/sec | 273K ops/sec | 147K ops/sec | 1.1M ops/sec | 3.3M ops/sec |
| Browser + Node.js | Yes | Yes | Yes | Yes | Yes |
| Template Literals | Native | No | No | No | No |

$${INCLUDE('docs-intro.md')}

$${INCLUDE('docs-basic.md')}

$${INCLUDE('docs-include.md')}

$${INCLUDE('docs-layout.md')}

$${INCLUDE('docs-if.md')}

$${INCLUDE('docs-map.md')}

$${INCLUDE('docs-extend.md')}

$${INCLUDE('docs-bench.md')}

$${INCLUDE('docs-security.md')}

$${INCLUDE('docs-license.md')}

$${INCLUDE('docs-other.md')}

---
Docs revision: $${data.date}
