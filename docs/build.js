import { readFileSync, writeFileSync } from 'node:fs'
import { join, parse } from 'node:path'
import { ZzzBase, useFn, useInclude, useContentTrim, useIfMap } from 'zzz-template/fs.js'

export class ZzzDocs extends ZzzBase {
  constructor ($this = {}) {
    super($this)
    this._dir = $this.dir || ''
    useContentTrim(this)
    useInclude(this)
    useIfMap(this)
    useFn(
      this,
      function includeExample (name, file) {
        const parsed = parse(file)
        const dir = parsed.dir
        const type = parsed.ext.slice(1)
        let content = readFileSync(join(this.dir, '..', file), 'utf8').trim()
        return this.include(`_example.md`, { content, name, file, type, dir })
      },
      'EXAMPLE'
    )
  }

  read (f) {
    let input = readFileSync(join(this._dir, f), 'utf8')
    input = input.replace(/\$\$/g, '%%%')
    input = input.replace(/`/g, '\\`')
    input = input.replace(/\$/g, '\\$')
    input = input.replace(/%%%/g, '$')
    return input
  }
}

const zzz = new ZzzDocs({ dir: import.meta.dirname })
const result = zzz.render('docs.md', { date: new Date().toISOString() })

writeFileSync(join(import.meta.dirname, '../README.md'), result)
