var glob = require('glob')
var jsdom = require('jsdom')

describe('Node/io.js', function() {

  it('require tags', function() {
    glob('../tag/*.tag', { cwd: __dirname }, function (err, tags) {
      expect(err).to.be(null)
      tags.forEach(function(tag) {
        expect(require(tag)).to.be.ok()
      })
    })
  })

  it('render tag: timer', function() {
    var tmr = riot.render('timer', { start: 42 })
    expect(tmr).to.be('<timer><p>Seconds Elapsed: 42</p></timer>')
  })

  it('render tag: if-test', function() {
    var ift = riot.render('if-test')
    var doc = jsdom.jsdom(ift)
    var els = doc.querySelectorAll('if-child')
    expect(els.length).to.be(1)
    expect(els[0].attributes.length).to.be(1)
    expect(els[0].attributes[0].name).to.be('style')
    expect(els[0].attributes[0].value).to.be('display: none;')
  })

  it('render tag: loop-child', function() {
    var lpc = riot.render('loop-child')
    var doc = jsdom.jsdom(lpc)
    var els = doc.querySelectorAll('looped-child')
    expect(els.length).to.be(2)
    var h3s = doc.querySelectorAll('h3')
    expect(h3s.length).to.be(2)
    expect(h3s[0].firstChild.nodeValue).to.be('one')
    expect(h3s[1].firstChild.nodeValue).to.be('two')
  })

  it('render tag: loop-replace', function() {
    var lpr = riot.render('loop-replace')
    var doc = jsdom.jsdom(lpr)
    var els = doc.querySelectorAll('strong')
    expect(els.length).to.be(3)
    expect(els[0].firstChild.nodeValue).to.be('a')
    expect(els[1].firstChild.nodeValue).to.be('9')
    expect(els[2].firstChild.nodeValue).to.be('3')
  })

  it('render tag: blog (using yield)', function() {
    var blg = riot.render('blog')
    var doc = jsdom.jsdom(blg)
    var els = doc.querySelectorAll('h2')
    expect(els.length).to.be(2)
    expect(els[0].firstChild.nodeValue).to.be('post 1')
    expect(els[1].firstChild.nodeValue).to.be('post 2')
  })

})
