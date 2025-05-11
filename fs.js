import {readFileSync} from 'node:fs'
import {join} from "node:path"
import {ZzzBase} from "./index.js"

export * from './index.js'

export class ZzzFs extends ZzzBase {
  constructor($this = {}) {
    super($this)
    this._dir = $this.dir || ''
  }
  read (f) {
    return readFileSync(join(this._dir, f), "utf8")
  }
}
