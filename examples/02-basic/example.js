import { ZzzFs } from 'zzz-template/fs.js'

const zzz = new ZzzFs({ dir: import.meta.dirname })
const result = zzz.render('template.html', { name: 'Jerry' })
console.log(result)
// OUTPUT:
// <p>
//   Hello Jerry
// </p>
