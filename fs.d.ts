import { ZzzBase } from "./index.js";

export * from './index.js';

export interface ZzzFsOptions extends Record<string, any> {
  dir?: string;
}

export class ZzzFs extends ZzzBase {
  _dir: string;
  constructor($this?: ZzzFsOptions);
  read(f: string): string;
}