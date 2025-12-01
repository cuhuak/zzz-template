export class ZzzTemplateBase {
  s = [] // s - start, before content
  e = [] // e - end, after content
  constructor($this = {}) {
    this.$ = $this
  }
  compile(str, local, sign = 'data, parent') {
    const fn = new Function(sign, `${this.s.join(';')}let content=\`${str}\`;${this.e.join(';')}return content;`)
    return fn.bind({...this.$, local}) // shallow copy of $
  }
  render(template, data, local = {}) {
    return this.compile(this.read(template), {...local})(data) // shallow copy of local
  }
  read(f) {} // must be implemented
}
export class ZzzTemplate extends ZzzTemplateBase {
  read (f) {
    return window.document.getElementById(f).innerText
  }
}
export function useFn(zzz, fn, alias) {
  zzz.$[fn.name] = fn
  if (alias) zzz.s.push(`let ${alias} = this.${fn.name}.bind(this);`)
}
export function useContentTrim(zzz) {
  zzz.e.push('content = content.trim();')
}
export function useInclude(zzz, alias = 'INCLUDE') {
  useFn(zzz, function include(file, data) {return zzz.compile(zzz.read(file), this.local)(data)}, alias)
}
export function useLayout(zzz, alias = 'LAYOUT') {
  zzz.$['include'] || useInclude(zzz)
  zzz.e.push('if(this._layout)return this.include(this._layout.t,{...this._layout.d,content});')
  useFn(zzz, function layout(t, d) {this._layout={t,d};return ''}, alias)
}
export function useLocal(zzz, aliasSet = 'SET', aliasSeta = 'SETA') {
  zzz.s.push('let local = this.local;')
  zzz.$.local = {}
  useFn(zzz, function set(key, values) {this.local[key] = values;return ''}, aliasSet)
  useFn(zzz, function seta(key, ...values) {this.local[key] = [(this.local[key] ?? []), ...values].flat();return ''}, aliasSeta)
}
export function useIfMap(zzz, aliases = true) {
  zzz.$['include'] || useInclude(zzz)
  useFn(zzz, function template(str, data) {return zzz.compile(str, this.local)(data)}, aliases && 'TEMPLATE')
  useFn(zzz, function if_template(cond, str, data) {return cond ? zzz.compile(str, this.local)(data) : ''}, aliases && 'IF')
  useFn(zzz, function if_include(cond, file, data) {return cond ? this.include(file, data) : ''}, aliases && 'IFI')
  useFn(zzz, function map_template(arr, str) {return arr.map(x => {return zzz.compile(str, this.local)(x)}).join('')}, aliases && 'MAP')
  useFn(zzz, function map_include(arr, file) {return arr.map(x => {return this.include(file, x)}).join('')}, aliases && 'MAPI')
}

// @deprecated ZzzBrowser, use ZzzTemplate class instead
export const ZzzBrowser = ZzzTemplate