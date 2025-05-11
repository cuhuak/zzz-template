import {ZzzBrowser} from "zzz-template"

const zzz = new ZzzBrowser()
const fn = zzz.compile('Hello ${data.name}') // returns function that renders your template using data: `fn(data)`
console.log(fn({name: 'Jerry'})); // > "Hello Jerry"
console.log(fn({name: 'Tom'})); // > "Hello Tom"
