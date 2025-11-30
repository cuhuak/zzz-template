import { ZzzTemplateNode } from 'zzz-template/node.js'

const zzz = new ZzzTemplateNode({ dir: import.meta.dirname })
const result = zzz.render('template.html', { name: 'Jerry' })
console.log(result)
// OUTPUT:
// <p>
//   Hello Jerry
// </p>
