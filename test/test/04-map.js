import {it, describe} from 'node:test'
import assert from 'node:assert'
import {ZzzTemplateBase, useIfMap} from 'zzz-template'

describe('map (mem)', () => {
  const templates = {
    'map_numbers': '${MAP(data.items, "${data}")}',
    'map_objects': '${MAP(data.items, "${data.number}")}',

    'mapi_numbers': '${MAPI(data.items, "template_numbers")}',
    'template_numbers': "${data}",

    'mapi_objects': '${MAPI(data.items, "template_objects")}',
    'template_objects': "${data.number}",
  }

  const renderer = new ZzzTemplateBase()
  renderer.read = (f) => templates[f]
  useIfMap(renderer)

  describe('map_numbers', () => {
    it('1234', () => {
      assert.strictEqual(
        renderer.render('map_numbers', {items: [1, 2, 3, 4]}),
        '1234'
      )
    })
  })

  describe('map_objects', () => {
    it('1234', () => {
      assert.strictEqual(
        renderer.render('map_objects', {items: [{number: 1}, {number: 2}, {number: 3}, {number: 4}]}),
        '1234'
      )
    })
  })

  describe('mapi_numbers', () => {
    it('1234', () => {
      assert.strictEqual(
        renderer.render('mapi_numbers', {items: [1, 2, 3, 4]}),
        '1234'
      )
    })
  })

  describe('mapi_objects', () => {
    it('1234', () => {
      assert.strictEqual(
        renderer.render('mapi_objects', {items: [{number: 1}, {number: 2}, {number: 3}, {number: 4}]}),
        '1234'
      )
    })
  })
})
