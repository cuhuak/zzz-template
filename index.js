export class ZzzTemplateBase {
  s = [] // s - start, before content
  e = [] // e - end, after content
  constructor($this = {}) {
    this.$ = $this
  }
  compile(str, local, sign = 'data, parent') {
    const fn = new Function(sign, `${this.s.join(';')}var content=\`${str}\`;${this.e.join(';')}return content;`) // var to work "with"
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
  zzz.$[alias] = fn
  zzz.s.push(`let ${alias} = this.${alias}.bind(this);`)
}
export function useContentTrim(zzz) {
  zzz.e.push('content = content.trim();')
}
export function useInclude(zzz) {
  useFn(zzz, function (file, data) {return zzz.compile(zzz.read(file), this.local)(data)}, 'INCLUDE')
}
export function useLayout(zzz) {
  zzz.$['INCLUDE'] || useInclude(zzz)
  zzz.e.push('if(this._layout)return INCLUDE(this._layout.t,{...this._layout.d,content});')
  useFn(zzz, function (t, d) {this._layout={t,d};return ''}, 'LAYOUT')
}
export function useLocal(zzz) {
  zzz.s.push('let local = this.local;')
  zzz.$.local = {}
  useFn(zzz, function (key, values) {this.local[key] = values;return ''}, 'SET')
  useFn(zzz, function (key, ...values) {this.local[key] = [(this.local[key] ?? []), ...values].flat();return ''}, 'SETA')
}
export function useIfMap(zzz) {
zzz.$['INCLUDE'] || useInclude(zzz)
  useFn(zzz, function (str, data) {return zzz.compile(str, this.local)(data)}, 'TEMPLATE')
  useFn(zzz, function (cond, str, data) {return cond ? zzz.compile(str, this.local)(data) : ''}, 'IF')
  useFn(zzz, function (cond, file, data) {return cond ? this.INCLUDE(file, data) : ''}, 'IFI')
  useFn(zzz, function (arr, str) {return arr.map(x => {return zzz.compile(str, this.local)(x)}).join('')}, 'MAP')
  useFn(zzz, function (arr, file) {return arr.map(x => {return this.INCLUDE(file, x)}).join('')}, 'MAPI')
}

// @deprecated ZzzBrowser, use ZzzTemplate class instead
export const ZzzBrowser = ZzzTemplate