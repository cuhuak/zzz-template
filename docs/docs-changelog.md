## Changelog

### 2.0.0

- **Breaking**: `useFn` simplified - now accepts `(zzz, fn, name)` and registers function by ALIAS (not fn.name)
- **Breaking**: `useInclude`, `useLocal`, `useIfMap` now use built-in aliases (not customizable)
- **Deprecated**: `ZzzBrowser` - use `ZzzTemplate` instead
- **Deprecated**: `ZzzFs` - use `ZzzTemplateNode` instead
- Added `with` statement example for cleaner template syntax
