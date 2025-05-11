;(async () => {
  const n = 1e5
  const fs = require('fs')
  const Benchmark = require('benchmark')

  function readTemplate(f) {
    return fs.readFileSync(`${__dirname}/${f}`, 'utf8')
  }

  const wait = () =>
    new Promise(resolve => {
      setTimeout(resolve, 100)
    })

  const zzz = new (require('zzz-template').ZzzBase)
  const compileZzz = zzz.compile.bind(zzz)
  const compileVanilla = function (tpl) { return new Function('data', `\`${tpl}\``) }
  const compileTemplateLiteral = require('template-literal')
  const compileZup = require('zup')
  const compileEjs = require('ejs').compile
  const compileDot = require('dot').template
  const Edge = require('edge.js').Edge;
  const edge = Edge.create();
  edge.mount('./');

  const tplZzz = readTemplate('./template-zzz.html')
  const tplVanilla = tplZzz
  const tplTemplateLiteral = readTemplate('template-template-literal.html')
  const tplZup = readTemplate('template-zup.html')
  const tplEjs = readTemplate('template-ejs.html')
  const tplDot = readTemplate('template-dot.html')
  const tplEdge = readTemplate('template-edge.html')

  const data = {
    heading: 'This title will be truncated',
    content: `My life story, and I'm not kidding this time...`,
    alert: '<b>HI MOM!</b>'
  }

  const optionsZup = {}
  const optionsEjs = {localsName: 'z'}
  const optionsDot = {
    evaluate: /\[\[([\s\S]+?)]]/g,
    interpolate: /\[\[-([\s\S]+?)]]/g,
    encode: /\[\[=([\s\S]+?)]]/g,
    varname: 'z',
    strip: false
  }

  const compiledVanilla = compileVanilla(tplVanilla)
  const compiledZzz = compileZzz(tplZzz)
  const compiledTemplateLiteral = compileTemplateLiteral(tplTemplateLiteral)
  const compiledZup = compileZup(tplZup, optionsZup)
  const compiledEjs = compileEjs(tplEjs, optionsEjs)
  const compiledDot = compileDot(tplDot, optionsDot)
  const compiledEdge = data => edge.renderRawSync(tplEdge, data)

  console.log('--------- console.time Compile ---------')
  {
    console.time('vanilla compile')
    for (let i = 0; i < n; ++i) compileVanilla(tplVanilla)
    console.timeEnd('vanilla compile')

    console.time('zzz compile')
    for (let i = 0; i < n; ++i) compileZzz(tplZzz)
    console.timeEnd('zzz compile')

    await wait()

    console.time('literal compile')
    for (let i = 0; i < n; ++i) compileTemplateLiteral(tplTemplateLiteral)
    console.timeEnd('literal compile')

    await wait()

    console.time('zup compile')
    for (let i = 0; i < n; ++i) compileZup(tplZup, optionsZup)
    console.timeEnd('zup compile')

    await wait()

    console.time('ejs compile')
    for (let i = 0; i < n; ++i) compileEjs(tplEjs, optionsEjs)
    console.timeEnd('ejs compile')

    await wait()

    console.time('doT compile')
    for (let i = 0; i < n; ++i) compileDot(tplDot, optionsDot)
    console.timeEnd('doT compile')

    await wait()

    console.time('edge compile')
    for (let i = 0; i < n; ++i) edge.compiler.compileRaw(tplEdge)
    console.timeEnd('edge compile')

    await wait()
  }

  console.log('--------- console.time Render ---------')
  {
    console.time('vanilla render')
    for (let i = 0; i < n; ++i) compiledVanilla(data)
    console.timeEnd('vanilla render')

    await wait()

    console.time('zzz render')
    for (let i = 0; i < n; ++i) compiledZzz(data)
    console.timeEnd('zzz render')

    await wait()

    console.time('literal render')
    for (let i = 0; i < n; ++i) compiledTemplateLiteral(data)
    console.timeEnd('literal render')

    await wait()

    console.time('zup render')
    for (let i = 0; i < n; ++i) compiledZup(data)
    console.timeEnd('zup render')

    await wait()

    console.time('ejs render')
    for (let i = 0; i < n; ++i) compiledEjs(data)
    console.timeEnd('ejs render')

    await wait()

    console.time('doT render')
    for (let i = 0; i < n; ++i) compiledDot(data)
    console.timeEnd('doT render')

    await wait()

    console.time('edge render')
    for (let i = 0; i < n; ++i) compiledEdge(data)
    console.timeEnd('edge render')

    await wait()
  }

  console.log('--------- Benchmark Compile ---------')
  {
    let compileSuite = new Benchmark.Suite('')

    compileSuite
      .add('vanilla compile', function () {
        compileVanilla(tplVanilla)
      })
      .add('Zzz compile', function () {
        compileZzz(tplZzz)
      })
      .add('Literal compile', function () {
        compileTemplateLiteral(tplTemplateLiteral)
      })
      .add('Zup compile', function () {
        compileZup(tplZup, optionsZup)
      })
      .add('Ejs compile', function () {
        compileEjs(tplEjs, optionsEjs)
      })
      .add('Dot compile', function () {
        compileDot(tplDot, optionsDot)
      })
      .add('Edge compile', function () {
        edge.compiler.compileRaw(tplEdge)
      })
      .on('cycle', function (event) {
        console.log(String(event.target))
      })
      .on('complete', function () {
        console.log('Fastest is ' + this.filter('fastest').map('name').join(', '))
      })
      .on('error', function (err) {
        console.error(err)
      })
      .run()

    await wait()
  }

  console.log('--------- Benchmark Render ---------')
  {
    let renderSuite = new Benchmark.Suite('')

    renderSuite
      .add('vanilla render', function () {
        compiledVanilla(data)
      })
      .add('zzz render', function () {
        compiledZzz(data)
      })
      .add('literal render', function () {
        compiledTemplateLiteral(data)
      })
      .add('zup render', function () {
        compiledZup(data)
      })
      .add('ejs render', function () {
        compiledEjs(data)
      })
      .add('dot render', function () {
        compiledDot(data)
      })
      .add('edge render', function () {
        compiledEdge(data)
      })
      .on('cycle', function (event) {
        console.log(String(event.target))
      })
      .on('complete', function () {
        console.log('Fastest is ' + this.filter('fastest').map('name').join(', '))
      })
      .run()
  }
})()
