import { ZzzTemplateBase } from "./index.js";

export * from './index.js';

export interface ZzzTemplateNodeOptions extends Record<string, any> {
  dir?: string;
}

export class ZzzTemplateNode extends ZzzTemplateBase {
  _dir: string;
  constructor($this?: ZzzTemplateNodeOptions);
  read(f: string): string;
}