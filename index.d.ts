export class ZzzBase {
  s: string[];
  e: string[];
  $: Record<string, any>;
  constructor($this?: Record<string, any>);
  compile(str: string, local?: Record<string, any>, sign?: string): (data: any, parent?: any) => string;
  render(template: string, data: any, local?: Record<string, any>): string;
  read(f: string): string;
}

export class ZzzBrowser extends ZzzBase {
  read(f: string): string;
}

export function useFn(zzz: ZzzBase, fn: Function, alias?: string | false): void;
export function useContentTrim(zzz: ZzzBase): void;
export function useInclude(zzz: ZzzBase, alias?: string): void;
export function useLayout(zzz: ZzzBase, alias?: string): void;
export function useLocal(zzz: ZzzBase, aliasSet?: string, aliasSeta?: string): void;
export function useIfMap(zzz: ZzzBase, aliases?: boolean): void;