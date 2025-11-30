import {readFileSync} from 'node:fs'
import {join} from "node:path"
import {ZzzTemplateBase} from "./index.js"

export * from './index.js'

export class ZzzTemplateNode extends ZzzTemplateBase {
  constructor($this = {}) {
    super($this)
    this._dir = $this.dir || ''
  }
  read (f) {
    return readFileSync(join(this._dir, f), "utf8")
  }
}

// @deprecated
export const ZzzFs = ZzzTemplateNode