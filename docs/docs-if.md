## Conditions IF
* `useIfMap(zzz)` to enable "if, each" feature
* `${IF(data.n === 42, 'Hello ${data.name}!', {name: 'world'})}` to echo string on condition
* you may want to pass data into template

$${EXAMPLE('Example Condition IF', 'examples/04-if/if.html')}

## Conditions IFI
* `useIfMap(zzz)` to enable "if, each" feature
* `${IFI(condition, 'template', data)}`: if `condition` then include `template` with `data`
* do not forget to pass data

$${EXAMPLE('Example Condition IFI: `if (condition) include`', 'examples/04-if/ifi.html')}
