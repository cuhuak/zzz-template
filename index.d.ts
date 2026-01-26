export class ZzzTemplateBase {
  s: string[];
  e: string[];
  $: Record<string, any>;
  constructor($this?: Record<string, any>);
  compile(str: string, local?: Record<string, any>, sign?: string): (data: any, parent?: any) => string;
  render(template: string, data: any, local?: Record<string, any>): string;
  read(f: string): string;
}

export class ZzzTemplate extends ZzzTemplateBase {
  read(f: string): string;
}

export function useFn(zzz: ZzzTemplateBase, fn: Function, alias: string): void;
export function useContentTrim(zzz: ZzzTemplateBase): void;
export function useInclude(zzz: ZzzTemplateBase): void;
export function useLayout(zzz: ZzzTemplateBase): void;
export function useLocal(zzz: ZzzTemplateBase): void;
export function useIfMap(zzz: ZzzTemplateBase): void;