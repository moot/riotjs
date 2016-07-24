var glob = require('glob'),
  riot = require('../../../lib/server'),
  expect = require('chai').expect,
  cheerio = require('cheerio')

describe('Node/io.js', function() {

  // adds custom riot parsers used by some tag/*.tag files
  // css
  riot.parsers.css.myparser = function (tag, css) {
    return css.replace(/@tag/, tag)
  }
  // js
  riot.parsers.js.myparser = function (js) {
    return js.replace(/@version/, '1.0.0')
  }

  it('require tags', function(done) {
    glob('../../tag/*.tag', { cwd: __dirname }, function (err, tags) {
      expect(err).to.be.equal(null)
      tags.forEach(function(tag) {
        expect(require(tag)).to.be.ok
      })
      done()
    })
  })

  it('render tag: timer', function() {
    var tmr = riot.render('timer', { start: 42 })
    expect(tmr).to.be.equal('<timer><p>Seconds Elapsed: 42</p></timer>')
  })

  it('render tag: if-test', function() {
    var ift = riot.render('if-test')
    var $ = cheerio.load(ift)
    var els = $('if-child')
    expect(els.length).to.be.equal(1)
    expect(els.first().attr('style')).to.be.equal('display: none;')
  })

  it('render tag: attr-test', function() {
    var content = riot.render('attr-test', { red: true })
    expect(content).to.be.equal('<attr-test><input type="checkbox" class="red"> </attr-test>')

    content = riot.render('attr-test', { isChecked: true, includeTable: true })
    expect(content).to.be.equal('<attr-test><input type="checkbox" checked="checked"> <table></table></attr-test>')

    content = riot.render('attr-test', { isChecked: null, checkboxId: 0, includeTable: true, tableBorder: 0 })
    expect(content).to.be.equal('<attr-test><input type="checkbox" id="0"> <table border="0"></table></attr-test>')

    content = riot.render('attr-test', { isChecked: 0, checkboxId: 99 })
    expect(content).to.be.equal('<attr-test><input type="checkbox" id="99"> </attr-test>')
  })

  it('render tag: loop-child', function() {
    var lpc = riot.render('loop-child')
    var $ = cheerio.load(lpc)
    expect($('looped-child').length).to.be.equal(2)
    var h3s = $('h3')
    expect(h3s.length).to.be.equal(2)
    expect(h3s.first().text()).to.be.equal('one')
    expect(h3s.last().text()).to.be.equal('two')
  })

  it('render tag: loop-replace', function() {
    var lpr = riot.render('loop-replace')
    var $ = cheerio.load(lpr)
    var els = $('strong')
    expect(els.length).to.be.equal(3)
    expect(els.first().text()).to.be.equal('a')
    expect(els.first().next().text()).to.be.equal('9')
    expect(els.last().text()).to.be.equal('3')
  })

  it('render tag: blog (using yield)', function() {
    var blg = riot.render('blog')
    var $ = cheerio.load(blg)
    var els = $('h2')
    expect(els.length).to.be.equal(2)
    expect(els.first().text()).to.be.equal('post 1')
    expect(els.last().text()).to.be.equal('post 2')
  })

  it('tender tag: loop table', function() {
    var tbl = riot.render('table-loop-extra-row'),
      $ = cheerio.load(tbl)
    expect($('table tr').length).to.be.equal(5)
  })

  it('render tag: simple block (using yield)', function() {
    var blk = riot.render('block')
    var $ = cheerio.load(blk)
    expect($('block').length).to.be.equal(1)
    expect($('yoyo').length).to.be.equal(1)
    expect($('yoyo').html()).to.be.equal('Hello World!')
  })

  it('render tag: yield with no html content', function() {
    var blk = riot.render('yield-empty')
    expect(blk).to.be.equal('<yield-empty></yield-empty>')
  })

  it('render tag: svg loops', function() {
    var svg = riot.render('loop-svg-nodes')
    var $ = cheerio.load(svg)
    expect($('circle').length).to.be.equal(3)
  })

  it('render tag: loops having conditional directives', function() {
    var tag = riot.render('loop-conditional')
    var $ = cheerio.load(tag)
    expect($('loop-conditional-item').length).to.be.equal(2)
  })

  it('render tag: input,option,textarea tags having expressions as value', function() {
    var frm = riot.render('form-controls', { text: 'my-value' })
    var $ = cheerio.load(frm)
    expect($('input[type="text"]').val()).to.be.equal('my-value')
    expect($('select option:selected').val()).to.be.equal('my-value')
    expect($('textarea[name="txta1"]').val()).to.be.equal('my-value')
    expect($('textarea[name="txta2"]').val()).to.be.equal('')
  })

})
