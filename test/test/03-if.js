import {it, describe} from 'node:test'
import assert from 'node:assert'
import {ZzzTemplateBase, useIfMap} from 'zzz-template'

describe('if (mem)', () => {
  const templates = {
    'if': '${IF(data.condition, "${data.hello}", data)}' +
      '${IF(!data.condition, "${data.bye}", data)}',

    'ifi': '${IFI(data.condition, "template", {message: data.hello})}' +
      '${IFI(!data.condition, "template", {message: data.bye})}',
    'template': "${data.message}",
  }

  const renderer = new ZzzTemplateBase()
  renderer.read = (f) => templates[f]
  useIfMap(renderer)

  describe('if true', () => {
    it('hello', () => {
      assert.strictEqual(
        renderer.render('if', {condition: true, hello: 'hello', bye: 'bye'}),
        'hello'
      )
    })
  })

  describe('if false', () => {
    it('hello', () => {
      assert.strictEqual(
        renderer.render('if', {condition: false, hello: 'hello', bye: 'bye'}),
        'bye'
      )
    })
  })

  describe('ifi true', () => {
    it('hello', () => {
      assert.strictEqual(
        renderer.render('ifi', {condition: true, hello: 'hello', bye: 'bye'}),
        'hello'
      )
    })
  })

  describe('ifi false', () => {
    it('hello', () => {
      assert.strictEqual(
        renderer.render('ifi', {condition: false, hello: 'hello', bye: 'bye'}),
        'bye'
      )
    })
  })
})
