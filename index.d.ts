export class ZzzTemplateBase {
  s: string[];
  e: string[];
  $: Record<string, any>;
  constructor($this?: Record<string, any>);
  compile(str: string, local?: Record<string, any>, sign?: string): (data: any, parent?: any) => string;
  render(template: string, data: any, local?: Record<string, any>): string;
  read(f: string): string;
}

export class ZzzBrowser extends ZzzTemplateBase {
  read(f: string): string;
}

export function useFn(zzz: ZzzTemplateBase, fn: Function, alias?: string | false): void;
export function useContentTrim(zzz: ZzzTemplateBase): void;
export function useInclude(zzz: ZzzTemplateBase, alias?: string): void;
export function useLayout(zzz: ZzzTemplateBase, alias?: string): void;
export function useLocal(zzz: ZzzTemplateBase, aliasSet?: string, aliasSeta?: string): void;
export function useIfMap(zzz: ZzzTemplateBase, aliases?: boolean): void;