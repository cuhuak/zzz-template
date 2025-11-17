## Features
- echo: `${data.user.name}`
- layouts: set layout in child template `${LAYOUT("layout.html")}`, echo content `${data.content}` in `layout.html`
- include (partial) template: `${INCLUDE('partial.html', data)}`
- local variables: `${SET('title', 'Hello world')}`, then use it in template (partial, layout): `${local.title}`
- fast, ultra fast, mega fast, m-m-m-monster fast
- no deps
- tiny, ~50 lines of code, ~500 bytes min gzipped
- hackable! lol? you will see
- works on server and browser

## Get started

``` npm
npm install zzz-template --save
```
