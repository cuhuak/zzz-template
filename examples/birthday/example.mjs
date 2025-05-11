import {useLayout, useLocal, useContentTrim, ZzzFs} from "zzz-template/fs.js"

const renderer = new ZzzFs()

useContentTrim(renderer)
useLocal(renderer)
useLayout(renderer)

const tpl = './message.html'
const data = {
  user: {
    gender: 'MALE',
    name: 'John',
  },
  amount: 42.01,
};

const local = {
  title: 'Title from JS',
  subject: 'Subject from JS (should be overridden by template)',
  emotes: [':)'],
}

console.log(renderer.render(tpl, data, local))
console.log('global.emotes:', local.emotes.length)
console.log('global.emotes:', local.emotes) // local.emotes is not changed
