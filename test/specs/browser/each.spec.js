import {
  injectHTML,
  $$,
  $,
  getNextSibling,
  getPreviousSibling,
  normalizeHTML
} from '../../helpers/index'

// include special tags to test specific features
import '../../tag/loop-svg-nodes.tag'
import '../../tag/loop-position.tag'
import '../../tag/table-data.tag'
import '../../tag/loop-option.tag'
import '../../tag/loop-optgroup.tag'
import '../../tag/loop-optgroup2.tag'
import '../../tag/loop-arraylike.tag'
import '../../tag/loop-ids.tag'
import '../../tag/loop-unshift.tag'
import '../../tag/loop-virtual.tag'
import '../../tag/loop-null-items.tag'
import '../../tag/loop-named.tag'
import '../../tag/loop-single-tags.tag'
import '../../tag/loop.tag'
import '../../tag/loop-cols.tag'
import '../../tag/loop-child.tag'
import '../../tag/loop-combo.tag'
import '../../tag/loop-reorder.tag'
import '../../tag/loop-reorder-inner.tag'
import '../../tag/loop-manip.tag'
import '../../tag/loop-object.tag'
import '../../tag/loop-tag-instances.tag'
import '../../tag/loop-numbers-nested.tag'
import '../../tag/loop-nested-strings-array.tag'
import '../../tag/loop-events.tag'
import '../../tag/loop-sync-options-nested.tag'
import '../../tag/loop-inherit.tag'
import '../../tag/loop-root.tag'
import '../../tag/loop-double-curly-brackets.tag'
import '../../tag/loop-conditional.tag'
import '../../tag/loop-protect-internal-attrs.tag'
import '../../tag/loop-noloop-option.tag'
import '../../tag/ploop-tag.tag'
import '../../tag/table-loop-extra-row.tag'
import '../../tag/obj-key-loop.tag'
import '../../tag/loop-sync-options.tag'
import '../../tag/outer.tag'
import '../../tag/reserved-names.tag'
import '../../tag/nested-parallel-loop.tag'

import '../../tag/select-test.tag'
import '../../tag/named-select.tag'

import '../../tag/table-thead-tfoot.tag'
import '../../tag/table-multibody.tag'
import '../../tag/table-thead-tfoot-nested.tag'
import '../../tag/table-test.tag'

import '../../tag/virtual-no-loop.tag'
import '../../tag/virtual-yield-loop.tag'

const expect = chai.expect

describe('Riot each', function() {
  it('the loop elements keep their position in the DOM', function() {
    injectHTML('<loop-position></loop-position>')
    var tag = riot.mount('loop-position')[0],
      h3 = tag.root.getElementsByTagName('h3')[0]

    expect(getPreviousSibling(h3).tagName.toLowerCase()).to.be.equal('p')
    expect(getNextSibling(h3).tagName.toLowerCase()).to.be.equal('p')

    tag.unmount()

  })

  it('SVGs nodes can be properly looped', function() {

    injectHTML('<loop-svg-nodes></loop-svg-nodes>')

    var tag = riot.mount('loop-svg-nodes')[0]

    expect($$('svg circle', tag.root).length).to.be.equal(3)

    tag.unmount()
  })

  it('the root keyword should be protected also in the loops', function() {

    injectHTML('<loop-root></loop-root>')
    var tag = riot.mount('loop-root')[0]

    expect($$('li', tag.root).length).to.be.equal(3)

    tag.splice()
    tag.update()

    expect($$('li', tag.root).length).to.be.equal(2)

    tag.unmount()

  })

  it('avoid to duplicate tags in multiple foreach loops', function() {

    injectHTML([
      '<outer id="outer1"></outer>',
      '<outer id="outer2"></outer>',
      '<outer id="outer3"></outer>'
    ])

    var mountTag = function(tagId) {
      var data = [],
        tag,
        itemsCount = 5

      while (itemsCount--) {
        data.push({
          value: 'item #' + itemsCount
        })
      }

      tag = riot.mount(tagId, {data: data})[0]
      // comment the following line to check the rendered html

      return tag

    }

    var outer1 = mountTag('#outer1'),
      outer2 = mountTag('#outer2'),
      outer3 = mountTag('#outer3')

    expect(outer1.root.getElementsByTagName('outer-inner').length).to.be.equal(5)
    expect(outer1.root.getElementsByTagName('span').length).to.be.equal(5)
    expect(outer1.root.getElementsByTagName('p').length).to.be.equal(5)
    expect(outer2.root.getElementsByTagName('outer-inner').length).to.be.equal(5)
    expect(outer2.root.getElementsByTagName('span').length).to.be.equal(5)
    expect(outer2.root.getElementsByTagName('p').length).to.be.equal(5)
    expect(outer3.root.getElementsByTagName('outer-inner').length).to.be.equal(5)
    expect(outer3.root.getElementsByTagName('span').length).to.be.equal(5)
    expect(outer3.root.getElementsByTagName('p').length).to.be.equal(5)

    outer1.unmount()
    outer2.unmount()
    outer3.unmount()

  })

  it('the each loops update correctly the DOM nodes', function() {

    injectHTML('<loop></loop>')

    var onItemClick = function(e) {
        var elIndex = Array.prototype.slice.call(children).indexOf(e.currentTarget)
        expect(tag.items[elIndex]).to.be.equal(e.item.item)
      },
      removeItemClick = function(e) {
        var index = tag.removes.indexOf(e.item)
        if (index < 0) return
        tag.removes.splice(index, 1)
      },
      tag = riot.mount('loop', { onItemClick: onItemClick, removeItemClick: removeItemClick })[0],
      root = tag.root,
      button = root.getElementsByTagName('button')[0],
      children,
      itemsCount = 5

    tag.items = []
    tag.removes = []

    while (itemsCount--) {
      tag.removes.push({
        value: 'remove item #' + tag.items.length
      })
      tag.items.push({
        value: 'item #' + tag.items.length
      })
    }
    tag.update()

    // remove item make sure item passed is correct
    for (var i = 0; i < tag.items.length; i++) {
      var curItem = tag.removes[0],
        ev = new CustomEvent('click'),
        el = root.getElementsByTagName('dt')[0]
      el.dispatchEvent(ev)
      expect(curItem).to.be.equal(ev.item)
    }

    children = root.getElementsByTagName('li')
    Array.prototype.forEach.call(children, function(child) {
      child.dispatchEvent(new CustomEvent('click'))
    })
    expect(children.length).to.be.equal(5)

    // no update is required here
    button.dispatchEvent(new CustomEvent('click'))
    children = root.getElementsByTagName('li')
    expect(children.length).to.be.equal(10)

    Array.prototype.forEach.call(children, function(child) {
      child.dispatchEvent(new CustomEvent('click'))
    })

    expect(normalizeHTML(root.getElementsByTagName('ul')[0].innerHTML)).to.be.equal('<li>0 item #0 </li><li>1 item #1 </li><li>2 item #2 </li><li>3 item #3 </li><li>4 item #4 </li><li>5 item #5 </li><li>6 item #6 </li><li>7 item #7 </li><li>8 item #8 </li><li>9 item #9 </li>')

    tag.items.reverse()
    tag.update()
    children = root.getElementsByTagName('li')
    expect(children.length).to.be.equal(10)
    Array.prototype.forEach.call(children, function(child) {
      child.dispatchEvent(new CustomEvent('click'))
    })

    expect(normalizeHTML(root.getElementsByTagName('ul')[0].innerHTML)).to.be.equal('<li>0 item #9 </li><li>1 item #8 </li><li>2 item #7 </li><li>3 item #6 </li><li>4 item #5 </li><li>5 item #4 </li><li>6 item #3 </li><li>7 item #2 </li><li>8 item #1 </li><li>9 item #0 </li>'.trim())

    var tempItem = tag.items[1]
    tag.items[1] = tag.items[8]
    tag.items[8] = tempItem
    tag.update()

    Array.prototype.forEach.call(children, function(child) {
      child.dispatchEvent(new CustomEvent('click'))
    })

    expect(normalizeHTML(root.getElementsByTagName('ul')[0].innerHTML)).to.be.equal('<li>0 item #9 </li><li>1 item #1 </li><li>2 item #7 </li><li>3 item #6 </li><li>4 item #5 </li><li>5 item #4 </li><li>6 item #3 </li><li>7 item #2 </li><li>8 item #8 </li><li>9 item #0 </li>'.trim())

    tag.items = null
    tag.update()
    expect(root.getElementsByTagName('li').length).to.be.equal(0)

    tag.unmount()

  })

  it('the event.item property gets handled correctly also in the nested loops', function() {

    injectHTML('<loop-events></loop-events>')

    var tag = riot.mount('loop-events', {
        cb: function(e, item) {
          eventsCounter++
          if (e.stopPropagation)
            e.stopPropagation()
          expect(JSON.stringify(item)).to.be.equal(JSON.stringify(testItem))
        }
      })[0],
      eventsCounter = 0,
      testItem

    // 1st test
    testItem = { outerCount: 'out', outerI: 0 }
    tag.root.getElementsByTagName('inner-loop-events')[0].dispatchEvent(new CustomEvent('click'))
    // 2nd test inner contents
    testItem = { innerCount: 'in', innerI: 0 }
    tag.root.getElementsByTagName('button')[1].dispatchEvent(new CustomEvent('click'))
    tag.root.getElementsByTagName('li')[0].dispatchEvent(new CustomEvent('click'))

    expect(eventsCounter).to.be.equal(3)

    tag.unmount()

  })

  it('can loop also collections including null items', function() {

    injectHTML('<loop-null-items></loop-null-items>')

    var tag = riot.mount('loop-null-items')[0]
    expect($$('li', tag.root).length).to.be.equal(7)
    tag.unmount()
  })

  it('each loop creates correctly a new context', function() {

    injectHTML('<loop-child></loop-child>')

    var tag = riot.mount('loop-child')[0],
      root = tag.root,
      children = root.getElementsByTagName('looped-child')

    expect(children.length).to.be.equal(2)
    expect(tag.tags['looped-child'].length).to.be.equal(2)
    expect(tag.tags['looped-child'][0].hit).to.be.a('function')
    expect(normalizeHTML(children[0].innerHTML)).to.be.equal('<h3>one</h3><button>one</button>')
    expect(normalizeHTML(children[1].innerHTML)).to.be.equal('<h3>two</h3><button>two</button>')

    tag.items = [ {name: 'one'}, {name: 'two'}, {name: 'three'} ]
    tag.update()
    expect(root.getElementsByTagName('looped-child').length).to.be.equal(3)

    expect(tag.tags['looped-child'][2].isMounted).to.be.equal(true)
    expect(tag.tags['looped-child'].length).to.be.equal(3)

    expect(root.getElementsByTagName('looped-child')[0].style.color).to.be.equal('red')
    root.getElementsByTagName('looped-child')[0].getElementsByTagName('button')[0].dispatchEvent(new CustomEvent('click'))
    expect(root.getElementsByTagName('looped-child')[0].style.color).to.be.equal('blue')

    tag.unmount()

  })


  it('the loop children tags must fire the \'mount\' event when they are already injectend into the parent', function(done) {

    injectHTML('<loop-child></loop-child>')

    var tag = tag = riot.mount('loop-child')[0],
      root = tag.root

    setTimeout(function() {
      tag.tags['looped-child'].forEach(function(child) {
        expect(child.mountWidth).to.be.above(0)
      })

      tag.childrenMountWidths.forEach(function(width) {
        expect(width).to.be.above(0)
      })

      tag.unmount()

      done()
    }, 100)

  })

  it('the `array.unshift` method does not break the loop', function() {

    injectHTML('<loop-unshift></loop-unshift>')

    var tag = riot.mount('loop-unshift')[0]

    expect(tag.tags['loop-unshift-item'].length).to.be.equal(2)
    expect(normalizeHTML(tag.root.getElementsByTagName('loop-unshift-item')[0].innerHTML)).to.be.equal('<p>woo</p>')
    tag.items.unshift({ name: 'baz' })
    tag.update()
    expect(normalizeHTML(tag.root.getElementsByTagName('loop-unshift-item')[0].innerHTML)).to.be.equal('<p>baz</p>')

    tag.unmount()

  })

  it('each loop adds and removes items in the right position (when multiple items share the same html)', function() {

    injectHTML('<loop-manip></loop-manip>')

    var tag = riot.mount('loop-manip')[0],
      root = tag.root,
      children = root.getElementsByTagName('loop-manip')

    tag.top()
    tag.update()
    tag.bottom()
    tag.update()
    tag.top()
    tag.update()
    tag.bottom()
    tag.update()

    expect(normalizeHTML(root.getElementsByTagName('ul')[0].innerHTML)).to.be.equal('<li>100 <a>remove</a></li><li>100 <a>remove</a></li><li>0 <a>remove</a></li><li>1 <a>remove</a></li><li>2 <a>remove</a></li><li>3 <a>remove</a></li><li>4 <a>remove</a></li><li>5 <a>remove</a></li><li>100 <a>remove</a></li><li>100 <a>remove</a></li>'.trim())

    tag.unmount()

  })


  it('tags in different each loops dont collide', function() {

    injectHTML('<loop-combo></loop-combo>')

    var tag = riot.mount('loop-combo')[0]

    expect(normalizeHTML(tag.root.innerHTML))
      .to.be.equal('<lci x="a"></lci><div><lci x="y"></lci></div>')

    tag.update({b: ['z']})

    expect(normalizeHTML(tag.root.innerHTML))
      .to.be.equal('<lci x="a"></lci><div><lci x="z"></lci></div>')

    tag.unmount()

  })

  it('iterate over an object, then modify the property and update itself', function() {

    injectHTML('<loop-object></loop-object>')

    var tag = riot.mount('loop-object')[0]
    var root = tag.root

    expect(normalizeHTML(root.getElementsByTagName('div')[0].innerHTML))
      .to.be.equal('<p>zero = 0</p><p>one = 1</p><p>two = 2</p><p>three = 3</p>')

    for (var key in tag.obj) { // eslint-disable-line guard-for-in
      tag.obj[key] = tag.obj[key] * 2
    }

    tag.update()
    expect(normalizeHTML(root.getElementsByTagName('div')[0].innerHTML))
      .to.be.equal('<p>zero = 0</p><p>one = 2</p><p>two = 4</p><p>three = 6</p>')

    tag.unmount()
  })

  it('the loop children instances get correctly removed in the right order', function() {

    injectHTML('<loop-ids></loop-ids>')

    var tag = riot.mount('loop-ids')[0],
      thirdItemId = tag.tags['loop-ids-item'][2]._riot_id

    tag.items.splice(0, 1)
    tag.update(tag.tags['loop-ids-item'])
    expect(tag.items.length).to.be.equal(2)
    // the second tag instance got removed
    // so now the third tag got moved to the second position
    expect(tag.tags['loop-ids-item'][1]._riot_id).to.be.equal(thirdItemId)

    tag.unmount()

  })

  it('each tag in the "tags" property can be looped', function() {

    injectHTML('<loop-single-tags></loop-single-tags>')

    var tag = riot.mount('loop-single-tags')[0]

    expect($$('ul li', tag.root).length).to.be.equal(4)

    tag.unmount()

  })

  it('loop option tag', function() {
    injectHTML('<loop-option></loop-option>')

    var tag = riot.mount('loop-option')[0],
      root = tag.root,
      options = root.getElementsByTagName('select')[0],
      html = normalizeHTML(root.innerHTML).replace(/ selected="selected"/, '')


    //expect(options[0].selected).to.be.equal(false)
    expect(options[1].selected).to.be.equal(true)
    expect(options[2].selected).to.be.equal(false)
    expect(options.selectedIndex).to.be.equal(1)

    tag.unmount()

  })

  it('the named on a select tag gets', function() {

    injectHTML('<named-select></named-select>')

    var tag = riot.mount('named-select')[0]

    expect(tag.daSelect).to.not.be.equal(undefined)
    expect(tag.daSelect.length).to.be.equal(2)

    tag.unmount()
  })

  it('loop optgroup tag', function() {

    injectHTML('<loop-optgroup></loop-optgroup>')

    var tag = riot.mount('loop-optgroup')[0],
      root = tag.root,
      select = $('select', root)

    expect(select.options[3].selected).to.be.equal(true)
    expect(select.options[0].value).to.be.equal('1')
    expect(select.options[0].text).to.be.equal('Option 1.1')
    expect(select.options[1].text).to.be.equal('Option 1.2')
    expect(select.selectedIndex).to.be.equal(3)

    tag.unmount()

  })

  it('loop optgroup tag (outer option, no closing option tags)', function() {

    injectHTML('<loop-optgroup2></loop-optgroup2>')

    var tag = riot.mount('loop-optgroup2')[0],
      root = tag.root,
      select = $('select', root)

    expect(select.options[0].selected).to.be.equal(true)
    expect(select.options[4].disabled).to.be.equal(true)
    expect(select.options[1].value).to.be.equal('1')
    expect(select.options[0].text).to.be.equal('<Select Option>')
    expect(select.selectedIndex).to.be.equal(0)

    tag.unmount()

  })

  it('loop tr table tag', function() {

    injectHTML('<table-data></table-data>')

    var tag = riot.mount('table-data')[0],
      root = tag.root

    expect(normalizeHTML(root.innerHTML)).to.match(/<h3>Cells<\/h3><table border="1"><tbody><tr><th>One<\/th><th>Two<\/th><th>Three<\/th><\/tr><tr><td>One<\/td><td>Two<\/td><td>Three<\/td><\/tr><\/tbody><\/table><h3>Rows<\/h3><table border="1"><tbody><tr><td>One<\/td><td>One another<\/td><\/tr><tr><td>Two<\/td><td>Two another<\/td><\/tr><tr><td>Three<\/td><td>Three another<\/td><\/tr><\/tbody><\/table>/)

    tag.unmount()

  })

  it('loop tr in tables preserving preexsisting rows', function() {

    injectHTML('<table-loop-extra-row></table-loop-extra-row>')

    var tag = riot.mount('table-loop-extra-row')[0],
      root = tag.root,
      tr = root.querySelectorAll('table tr')

    expect(tr.length).to.be.equal(5)
    expect(normalizeHTML(tr[0].innerHTML)).to.be.equal('<td>Extra</td><td>Row1</td>')
    expect(normalizeHTML(tr[4].innerHTML)).to.be.equal('<td>Extra</td><td>Row2</td>')

    tag.unmount()
  })

  it('loop reorder dom nodes', function() {

    injectHTML('<loop-reorder></loop-reorder>')

    var tag = riot.mount('loop-reorder')[0]
    expect(tag.root.querySelectorAll('span')[0].className).to.be.equal('nr-0')
    expect(tag.root.querySelectorAll('div')[0].className).to.be.equal('nr-0')
    tag.items.reverse()
    tag.update()
    expect(tag.root.querySelectorAll('span')[0].className).to.be.equal('nr-5')
    expect(tag.root.querySelectorAll('div')[0].className).to.be.equal('nr-0')

    tag.unmount()
  })

  it('loop reorder dom nodes with inner content intact', function() {

    injectHTML('<loop-reorder-inner></loop-reorder-inner>')

    var tag = riot.mount('loop-reorder-inner')[0]

    expect(tag.root.querySelectorAll('span')[0].style.color).to.be.equal('red')
    tag.items.reverse()
    tag.update()
    expect(tag.root.querySelectorAll('span')[1].style.color).to.be.equal('red')

    tag.unmount()
  })

  it('tags property in loop, varying levels of nesting', function() {

    injectHTML([
      '<ploop-tag></ploop-tag>',
      '<ploop1-tag></ploop1-tag>',
      '<ploop2-tag></ploop2-tag>',
      '<ploop3-tag></ploop3-tag>'
    ])

    var tag = riot.mount('ploop-tag, ploop1-tag, ploop2-tag, ploop3-tag', {
      elements: [{
        foo: 'foo',
        id: 0
      }, {
        foo: 'bar',
        id: 1
      }]
    })

    expect(tag[0].tags['ploop-child'].length).to.be.equal(2)
    expect(tag[0].tags['ploop-another']).to.be.an('object')
    expect(tag[1].tags['ploop-child'].length).to.be.equal(2)
    expect(tag[1].tags['ploop-another'].length).to.be.equal(2)
    expect(tag[2].tags['ploop-child'].length).to.be.equal(2)
    expect(tag[2].tags['ploop-another']).to.be.an('object')
    expect(tag[3].tags['ploop-child'].length).to.be.equal(2)
    expect(tag[3].tags['ploop-another']).to.be.an('object')

    tag.forEach(tag => tag.unmount())
  })

  it('dynamically named elements in a loop', function() {

    injectHTML('<loop-named></loop-named>')

    var tag = riot.mount('loop-named')[0]
    tag.on('mount', function () {
      expect(tag.first).name.to.be.equal('first')
      expect(tag.two).name.to.be.equal('two')
    })
    tag.unmount()
  })


  it('protect the internal "tags" attribute from external overrides', function() {
    injectHTML('<loop-protect-internal-attrs></loop-protect-internal-attrs>')
    var tag = riot.mount('loop-protect-internal-attrs')[0]
    expect(tag.tags['loop-protect-internal-attrs-child'].length).to.be.equal(4)
    tag.unmount()
  })

  it('the "updated" gets properly triggered also from the children tags in a loop', function(done) {

    injectHTML('<div id="updated-events-in-loop"></div>')
    var tag = riot.mount('#updated-events-in-loop', 'loop-unshift')[0],
      counter = 0

    tag.tags['loop-unshift-item'][0].on('updated', function() {
      counter ++
      if (counter == 2) done()
    })

    tag.update()
    tag.tags['loop-unshift-item'][0].update()

    tag.unmount()

  })

  it('the loops children sync correctly their internal data with their options', function() {

    injectHTML('<loop-sync-options></loop-sync-options>')
    var tag = riot.mount('loop-sync-options')[0]

    function ch(idx) {
      return tag.root.getElementsByTagName('loop-sync-options-child')[idx]._tag
    }

    expect(ch(0).val).to.be.equal('foo')
    expect(ch(0).root.className).to.be.equal('active')
    expect(ch(1).val).to.be.equal(undefined)
    expect(ch(2).val).to.be.equal(undefined)
    expect(ch(0).num).to.be.equal(undefined)
    expect(ch(1).num).to.be.equal(3)
    expect(ch(2).num).to.be.equal(undefined)
    expect(ch(0).bool).to.be.equal(undefined)
    expect(ch(1).bool).to.be.equal(undefined)
    expect(ch(2).bool).to.be.equal(false)
    tag.update({
      children: tag.children.reverse()
    })
    expect(ch(0).val).to.be.equal(undefined)
    expect(ch(0).root.className).to.be.equal('')
    expect(ch(1).val).to.be.equal(undefined)
    expect(ch(2).val).to.be.equal('foo')
    expect(ch(2).root.className).to.be.equal('active')
    expect(ch(0).num).to.be.equal(undefined)
    expect(ch(1).num).to.be.equal(3)
    expect(ch(2).num).to.be.equal(undefined)
    expect(ch(0).bool).to.be.equal(false)
    expect(ch(1).bool).to.be.equal(undefined)
    expect(ch(2).bool).to.be.equal(undefined)

    tag.update({
      children: tag.children.reverse()
    })
    expect(ch(0).val).to.be.equal('foo')
    expect(ch(0).root.className).to.be.equal('active')
    expect(ch(1).val).to.be.equal(undefined)
    expect(ch(2).val).to.be.equal(undefined)
    expect(ch(2).root.className).to.be.equal('')
    expect(ch(0).num).to.be.equal(undefined)
    expect(ch(1).num).to.be.equal(3)
    expect(ch(2).num).to.be.equal(undefined)
    expect(ch(0).bool).to.be.equal(undefined)
    expect(ch(1).bool).to.be.equal(undefined)
    expect(ch(2).bool).to.be.equal(false)
    tag.unmount()
  })


  it('the loops children sync correctly their internal data even when they are nested', function() {

    injectHTML('<loop-sync-options-nested></loop-sync-options-nested>')
    var tag = riot.mount('loop-sync-options-nested')[0]

    expect(tag.tags['loop-sync-options-nested-child'][0].parent.root.tagName.toLowerCase()).to.be.equal('loop-sync-options-nested')
    expect(tag.tags['loop-sync-options-nested-child'][0].val).to.be.equal('foo')
    expect(tag.tags['loop-sync-options-nested-child'][1].val).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][2].val).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][0].num).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][1].num).to.be.equal(3)
    expect(tag.tags['loop-sync-options-nested-child'][2].num).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][0].bool).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][1].bool).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][2].bool).to.be.equal(false)
    tag.update({
      children: tag.children.reverse()
    })
    tag.update()
    expect(tag.tags['loop-sync-options-nested-child'][0].val).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][1].val).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][2].val).to.be.equal('foo')
    expect(tag.tags['loop-sync-options-nested-child'][0].num).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][1].num).to.be.equal(3)
    expect(tag.tags['loop-sync-options-nested-child'][2].num).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][0].bool).to.be.equal(false)
    expect(tag.tags['loop-sync-options-nested-child'][1].bool).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][2].bool).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][2].parent.root.tagName.toLowerCase()).to.be.equal('loop-sync-options-nested')
    tag.update({
      children: tag.children.reverse()
    })
    tag.update()
    expect(tag.tags['loop-sync-options-nested-child'][0].val).to.be.equal('foo')
    expect(tag.tags['loop-sync-options-nested-child'][1].val).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][2].val).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][0].num).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][1].num).to.be.equal(3)
    expect(tag.tags['loop-sync-options-nested-child'][2].num).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][0].bool).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][1].bool).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][2].bool).to.be.equal(false)

    tag.unmount()
  })

  it('the children tags are in sync also in multiple nested tags', function() {

    injectHTML('<loop-sync-options-nested-wrapper></loop-sync-options-nested-wrapper>')
    var tag = riot.mount('loop-sync-options-nested-wrapper')[0]
    expect(tag.tags['loop-sync-options-nested'].tags['loop-sync-options-nested-child'].length).to.be.equal(3)
    tag.unmount()
  })

  it('looped options between other options get inserted correctly', function() {
    injectHTML('<loop-noloop-option></loop-noloop-option>')

    var tag = riot.mount('loop-noloop-option')[0]
    var options = tag.root.querySelectorAll('option')
    expect(options[1].value).to.be.equal('1')
  })

  it('children in a loop inherit properties from the parent', function() {
    injectHTML('<loop-inherit></loop-inherit>')
    var tag = riot.mount('loop-inherit')[0]
    expect(tag.me.opts.nice).to.be.equal(tag.isFun)
    tag.isFun = false
    tag.update()
    expect(tag.me.opts.nice).to.be.equal(tag.isFun)
    expect(tag.me.tags).to.be.empty
    tag.unmount()
  })

  it('loop tags get rendered correctly also with conditional attributes', function(done) {

    injectHTML('<loop-conditional></loop-conditional>')

    var tag = riot.mount('loop-conditional')[0]

    setTimeout(function() {
      expect(tag.root.getElementsByTagName('div').length).to.be.equal(2)
      expect(tag.root.getElementsByTagName('loop-conditional-item').length).to.be.equal(2)
      expect(tag.tags['loop-conditional-item'].length).to.be.equal(2)
      tag.items = []
      tag.update()
      expect(tag.root.getElementsByTagName('div').length).to.be.equal(0)
      expect(tag.root.getElementsByTagName('loop-conditional-item').length).to.be.equal(0)
      expect(tag.tags['loop-conditional-item']).to.be.equal(undefined)
      tag.items = [2, 2, 2]
      tag.update()
      expect(tag.root.getElementsByTagName('div').length).to.be.equal(3)
      expect(tag.root.getElementsByTagName('loop-conditional-item').length).to.be.equal(3)
      expect(tag.tags['loop-conditional-item'].length).to.be.equal(3)
      tag.unmount()
      done()
    }, 100)

    it('custom children items in a nested loop are always in sync with the parent tag', function() {

      injectHTML('<loop-inherit></loop-inherit>')

      var tag = riot.mount('loop-inherit')[0]

      expect(tag.tags['loop-inherit-item'].length).to.be.equal(4)
      expect(tag.me.opts.name).to.be.equal(tag.items[0])
      expect(tag.you.opts.name).to.be.equal(tag.items[1])
      expect(tag.everybody.opts.name).to.be.equal(tag.items[2])

      tag.items.splice(1, 1)
      tag.update()
      expect(tag.root.getElementsByTagName('div').length).to.be.equal(2)
      expect(tag.tags['loop-inherit-item'].length).to.be.equal(3)

      tag.items.push('active')
      tag.update()
      expect(tag.root.getElementsByTagName('div').length).to.be.equal(3)
      expect(tag.root.getElementsByTagName('div')[2].innerHTML).to.contain('active')
      expect(tag.root.getElementsByTagName('div')[2].className).to.be.equal('active')
      expect(tag.me.opts.name).to.be.equal(tag.items[0])
      expect(tag.you).to.be.equal(undefined)
      expect(tag.everybody.opts.name).to.be.equal(tag.items[1])
      expect(tag.boh.opts.name).to.be.equal('boh')
      expect(tag.tags['loop-inherit-item'].length).to.be.equal(4)

      tag.unmount()

    })

    it('the DOM events get executed in the right context', function() {
      injectHTML('<loop-inherit></loop-inherit>')
      var tag = riot.mount('loop-inherit')[0]
      tag.tags['loop-inherit-item'][0].root.onmouseenter({})
      expect(tag.wasHovered).to.be.equal(true)
      expect(tag.root.getElementsByTagName('div').length).to.be.equal(4)
      tag.tags['loop-inherit-item'][0].root.dispatchEvent(new CustomEvent('click'))
      expect(tag.tags['loop-inherit-item'][0].wasClicked).to.be.equal(true)

      tag.unmount()
    })

    it('loops over other tag instances do not override their internal properties', function() {
      injectHTML('<loop-tag-instances></loop-tag-instances>')
      var tag = riot.mount('loop-tag-instances')[0]

      tag.start()

      expect(tag.tags['loop-tag-instances-child'].length).to.be.equal(5)
      expect(tag.tags['loop-tag-instances-child'][0].root.tagName.toLowerCase()).to.be.equal('loop-tag-instances-child')
      tag.update()
      expect(tag.tags['loop-tag-instances-child'][3].root.tagName.toLowerCase()).to.be.equal('loop-tag-instances-child')

      tag.unmount()

    })


    it('nested loops using non object data get correctly rendered', function() {
      injectHTML('<loop-nested-strings-array></loop-nested-strings-array>')
      var tag = riot.mount('loop-nested-strings-array')[0],
        children = tag.root.getElementsByTagName('loop-nested-strings-array-item')
      expect(children.length).to.be.equal(4)
      children = tag.root.getElementsByTagName('loop-nested-strings-array-item')
      children[0].dispatchEvent(new CustomEvent('click'))
      expect(children.length).to.be.equal(4)
      expect(normalizeHTML(children[0].innerHTML)).to.be.equal('<p>b</p>')
      expect(normalizeHTML(children[1].innerHTML)).to.be.equal('<p>a</p>')
      tag.unmount()
    })

  })


  it('any DOM event in a loop updates the whole parent tag', function() {
    injectHTML('<loop-numbers-nested></loop-numbers-nested>')
    var tag = riot.mount('loop-numbers-nested')[0]
    expect(tag.root.getElementsByTagName('ul')[0].getElementsByTagName('li').length).to.be.equal(4)
    tag.root.getElementsByTagName('ul')[0].getElementsByTagName('li')[0].dispatchEvent(new CustomEvent('click'))
    expect(tag.root.getElementsByTagName('ul')[0].getElementsByTagName('li').length).to.be.equal(2)
    tag.unmount()
  })

  it('riot.observable instances could be also used in a loop', function() {
    injectHTML('<loop-child></loop-child>')
    var tag = riot.mount('loop-child')[0]

    tag.items = [riot.observable({name: 1}), {name: 2}]
    tag.update()
    tag.items = [{name: 2}]
    tag.update()

    tag.unmount()
  })

  it('the update event returns the tag instance', function() {
    injectHTML('<loop-child></loop-child>')
    var tag = riot.mount('loop-child')[0]
    expect(tag.update()).to.not.be.equal(undefined)
    tag.unmount()
  })


  it('table with multiple bodies and dynamic styles #1052', function() {

    injectHTML('<table-multibody></table-multibody>')

    var tag = riot.mount('table-multibody')[0],
      bodies = tag.root.getElementsByTagName('tbody')

    expect(bodies.length).to.be.equal(3)
    for (var i = 0; i < bodies.length; ++i) {
      expect(normalizeHTML(bodies[0].innerHTML))
        .to.match(/<tr style="background-color: ?(?:white|lime);?"[^>]*>(?:<td[^>]*>[A-C]\d<\/td>){3}<\/tr>/)
    }

    expect(bodies[0].getElementsByTagName('tr')[0].style.backgroundColor).to.be.equal('white')
    tag.root.getElementsByTagName('button')[0].dispatchEvent(new CustomEvent('click'))
    expect(bodies[0].getElementsByTagName('tr')[0].style.backgroundColor).to.be.equal('lime')

    tag.unmount()
  })

  it('table with tbody and thead #1549', function() {

    injectHTML('<table-thead-tfoot-nested></table-thead-tfoot-nested>')

    var tag = riot.mount('table-thead-tfoot-nested')[0],
      bodies = tag.root.getElementsByTagName('tbody'),
      heads = tag.root.getElementsByTagName('thead'),
      foots = tag.root.getElementsByTagName('tfoot')

    expect(bodies.length).to.be.equal(1)
    expect(heads.length).to.be.equal(1)
    expect(foots.length).to.be.equal(1)

    var ths = tag.root.getElementsByTagName('th'),
      trs = tag.root.getElementsByTagName('tr'),
      tds = tag.root.getElementsByTagName('td')

    expect(ths.length).to.be.equal(3)
    expect(trs.length).to.be.equal(5)
    expect(tds.length).to.be.equal(6)

    tag.unmount()
  })

  it('table with caption and looped cols, ths, and trs #1067', function() {
    injectHTML('<loop-cols></loop-cols>')
    var data = {
      // copied from loop-cols.tag
      headers: [
        'Name',
        'Number',
        'Address',
        'City',
        'Contact'
      ],
      data: [
        ['Abc', '10', 'A 4B', 'México', 'Juan'],
        ['Def', '20', 'B 50', 'USA', 'Anna'],
        ['Ghi', '30', 'D 60', 'Japan', ''],
        ['Jkl', '40', 'E 1C', 'France', 'Balbina']
      ]
    }
    var tag = riot.mount('loop-cols')[0],
      el, i, k

    tag.update()

    el = getEls('caption')[0]
    expect(el.innerHTML).to.be.equal('Loop Cols')

    el = getEls('colgroup')
    expect(el.length).to.be.equal(1)

    el = getEls('col', el[0])
    expect(el.length).to.be.equal(5)

    el = getEls('tr', getEls('thead')[0])
    expect(el.length).to.be.equal(1)

    el = getEls('th', el[0])
    expect(el.length).to.be.equal(5)
    for (i = 0; i < el.length; ++i) {
      expect(el[i].tagName).to.be.equal('TH')
      expect(el[i].innerHTML.trim()).to.be.equal(data.headers[i])
    }

    el = getEls('tr', getEls('tbody')[0])
    expect(el.length).to.be.equal(4)
    //console.log(' - - - tbody.tr: ' + el[0].innerHTML)

    for (i = 0; i < el.length; ++i) {
      var cells = getEls('td', el[i])
      expect(cells.length).to.be.equal(5)
      for (k = 0; k < cells.length; ++k) {
        //console.log(' - - - getting data[' + i + ',' + k + ']')
        expect(cells[k].tagName).to.be.equal('TD')
        expect(cells[k].innerHTML.trim()).to.be.equal(data.data[i][k])
      }
    }

    tag.unmount()

    function getEls(t, e) {
      if (!e) e = tag.root
      return e.getElementsByTagName(t)
    }
  })



  it('table/thead/tbody/tfoot used as root element of custom tags', function() {

    injectHTML('<table-test></table-test>')
    var
      tag = riot.mount('table-test')[0],
      tbl

    // set "tbl" to the table-test root element
    expect(tag).to.not.be.empty
    tbl = tag.root
    expect(tbl).to.not.be.empty
    tag.update()

    testTable(tbl, 'table-caption', {
      tbody: 1,
      caption: true,
      colgroup: true
    })
    testTable(tbl, 'table-colgroup', {
      thead: 1,
      tbody: 1,
      colgroup: true
    })
    testTable(tbl, 'table-looped-col', {
      thead: 1,
      tbody: 1,
      col: true
    })
    testTable(tbl, 'table-multi-col', {
      thead: 1,
      tbody: 1,
      col: true
    })
    testTable(tbl, 'table-tfoot', {
      tfoot: 1,
      tbody: 1
    })
    testTable(tbl, 'table-tr-body-only', {
      tr: 2
    })
    testTable(tbl, 'table-tr-alone', {
      tr: 1
    })
    testTable(tbl, 'table-custom-thead-tfoot', {
      thead: 1,
      tfoot: 1,
      tbody: 2,
      colgroup: true
    })

    tag.unmount()

    // test the table and call the tests for the content
    function testTable(root, name, info) {
      var s, key, inf

      root = root.querySelectorAll('table[data-is=' + name + ']')
      s = name + '.length: '
      expect(s + root.length).to.be.equal(s + '1')
      root = root[0]

      // test content
      for (key in info) { // eslint-disable-line
        if (info[key] === true)
          testOther(root, key)
        else
          testRows(root, key, info[key])
      }
    }

    // test rows and cells for an element of thead/tfoot/tbody
    function testRows(root, name, cnt) {
      var s, i, r, c, rows, cells, templ

      // check the count of this element
      root = root.getElementsByTagName(name)
      s = name + '.length: '
      expect(s + root.length).to.be.equal(s + cnt)
      if (name === 'tr') {
        name = 'tbody'
        root = [{ rows: root }]
        //...and leave cnt as-is, else adjust cnt to expected rows
      } else cnt = name === 'tbody' ? 2 : 1

      // check each element
      for (i = 0; i < root.length; i++) {
        // test the rows
        rows = root[i].rows
        expect(rows.length).to.be.equal(cnt)
        // test the cols
        for (r = 0; r < rows.length; r++) {
          c = name[1].toUpperCase()
          s = r + 1
          cells = rows[r].cells
          templ = c === 'B' ? 'R' + s + '-C' : c + '-'
          expect(cells.length).to.be.equal(2)
          expect(cells[0].innerHTML).to.contain(templ + '1')
          expect(cells[1].innerHTML).to.contain(templ + '2')
        }
      }
    }

    // test caption, colgroup and col elements
    function testOther(root, name) {
      var cols, s = name + '.length: '

      // we'll search the parent for <col>, later in the switch
      if (name !== 'col') {
        root = root.getElementsByTagName(name)
        expect(s + root.length).to.be.equal(s + '1')
        root = root[0]
      }
      switch (name) {
      case 'caption':
        expect(root.innerHTML).to.contain('Title')
        break
      case 'colgroup':
      case 'col':
        cols = root.getElementsByTagName('col')
        expect(cols).to.have.length(2)
        expect(cols[0].width).to.be.equal('150')
        expect(cols[1].width).to.be.equal('200')
        break
      default:
        break
      }
    }
  })

  it('select as root element of custom riot tag', function () {
    injectHTML('<select-test></select-test>')
    var
      CHOOSE = 0,     // option alone
      OPTION = 1,     // looped option
      OPTGRP = 2,     // optgroup with options
      list = {
        'select-single-option': [0, CHOOSE],
        'select-each-option': [1, OPTION],
        'select-each-option-prompt': [2, CHOOSE, OPTION],
        'select-each-two-options': [4, OPTION, OPTION],
        'select-optgroup-each-option': [0, OPTGRP],
        'select-optgroup-each-option-prompt': [0, CHOOSE, OPTGRP],
        'select-two-optgroup-each-option': [3, OPTGRP, CHOOSE, OPTGRP],
        'select-each-optgroup': [0, OPTGRP, OPTGRP]
      },
      sel, dat, tag = riot.mount('select-test')[0]

    expect(tag).to.not.be.empty
    for (var name in list) {                 // eslint-disable-line guard-for-in
      //console.log('Testing ' + name)
      dat = list[name]
      sel = tag.root.querySelector('select[data-is=' + name + ']')
      expect(sel).to.not.be.empty
      expect(sel.selectedIndex).to.be.equal(dat[0], name + '.selectIndex ' + sel.selectedIndex + ' expected to be ' + dat[0])
      var s1 = listFromSel(sel)
      var s2 = listFromDat(dat)
      expect(s1).to.be.equal(s2)
    }

    function listFromDat(dat) {
      var op = [], s = 'Opt1,Opt2,Opt3'
      for (var i = 1; i < dat.length; i++) {
        if (dat[i] === OPTGRP) op.push('G,' + s)
        else if (dat[i] === OPTION) op.push(s)
        else op.push('(choose)')
      }
      return op.join(',')
    }
    function listFromSel(el) {
      var op = []
      el = el.firstChild
      while (el) {
        if (el.tagName === 'OPTGROUP') {
          op.push('G')
          op = op.concat(listFromSel(el))
        } else if (el.tagName === 'OPTION') {
          op.push(el.text)
        }
        el = el.nextSibling
      }
      return op.join(',')
    }

    tag.unmount()
  })

  it('loops get rendered correctly also when riot.brackets get changed', function() {

    injectHTML('<loop-double-curly-brackets></loop-double-curly-brackets>')

    // change the brackets
    riot.settings.brackets = '{{ }}'
    var tag = riot.mount('loop-double-curly-brackets')[0],
      ps = tag.root.getElementsByTagName('p')

    expect(ps.length).to.be.equal(2)
    expect(ps[0].innerHTML).to.be.equal(ps[1].innerHTML)
    expect(ps[0].innerHTML).to.be.equal('hello')
    tag.change()
    expect(ps.length).to.be.equal(2)
    expect(ps[0].innerHTML).to.be.equal(ps[1].innerHTML)
    expect(ps[0].innerHTML).to.be.equal('hello world')

    tag.unmount()
    riot.settings.brackets = '{ }'

  })

  it('loops correctly on array subclasses', function() {
    injectHTML('<loop-arraylike></loop-arraylike>')
    var tag = riot.mount('loop-arraylike')[0],
      root = tag.root
    expect(normalizeHTML(root.getElementsByTagName('div')[0].innerHTML))
      .to.be.equal('<p>0 = zero</p><p>1 = one</p><p>2 = two</p><p>3 = three</p>')
    tag.unmount()
  })


  it('virtual tags mount inner content and not the virtual tag root', function() {
    injectHTML('<loop-virtual></loop-virtual>')
    var tag = riot.mount('loop-virtual')[0],
      els = tag.root.children

    expect(els[0].tagName).to.be.equal('DT')
    expect(els[0].innerHTML).to.be.equal('Coffee')
    expect(els[1].tagName).to.be.equal('DD')
    expect(els[1].innerHTML).to.be.equal('Black hot drink')
    expect(els[2].tagName).to.be.equal('DT')
    expect(els[2].innerHTML).to.be.equal('Milk')
    expect(els[3].tagName).to.be.equal('DD')
    expect(els[3].innerHTML).to.be.equal('White cold drink')

    tag.data.reverse()
    tag.update()

    expect(els[2].tagName).to.be.equal('DT')
    expect(els[2].innerHTML).to.be.equal('Coffee')
    expect(els[3].tagName).to.be.equal('DD')
    expect(els[3].innerHTML).to.be.equal('Black hot drink')
    expect(els[0].tagName).to.be.equal('DT')
    expect(els[0].innerHTML).to.be.equal('Milk')
    expect(els[1].tagName).to.be.equal('DD')
    expect(els[1].innerHTML).to.be.equal('White cold drink')

    tag.data.unshift({ key: 'Tea', value: 'Hot or cold drink' })
    tag.update()
    expect(els[0].tagName).to.be.equal('DT')
    expect(els[0].innerHTML).to.be.equal('Tea')
    expect(els[1].tagName).to.be.equal('DD')
    expect(els[1].innerHTML).to.be.equal('Hot or cold drink')
    tag.unmount()

    injectHTML('<loop-virtual-reorder></loop-virtual-reorder>')

    var tag2 = riot.mount('loop-virtual-reorder')[0],
      els2 = tag2.root.children

    els2[0].setAttribute('test', 'ok')
    expect(els2[0].getAttribute('test')).to.be.equal('ok')
    expect(els2[0].tagName).to.be.equal('DT')
    expect(els2[0].innerHTML).to.be.equal('Coffee')
    expect(els2[1].tagName).to.be.equal('DD')
    expect(els2[1].innerHTML).to.be.equal('Black hot drink')
    expect(els2[2].tagName).to.be.equal('DT')
    expect(els2[2].innerHTML).to.be.equal('Milk')
    expect(els2[3].tagName).to.be.equal('DD')
    expect(els2[3].innerHTML).to.be.equal('White cold drink')

    tag2.data.reverse()
    tag2.update()

    expect(els2[2].getAttribute('test')).to.be.equal('ok')
    expect(els2[2].tagName).to.be.equal('DT')
    expect(els2[2].innerHTML).to.be.equal('Coffee')
    expect(els2[3].tagName).to.be.equal('DD')
    expect(els2[3].innerHTML).to.be.equal('Black hot drink')
    expect(els2[0].tagName).to.be.equal('DT')
    expect(els2[0].innerHTML).to.be.equal('Milk')
    expect(els2[1].tagName).to.be.equal('DD')
    expect(els2[1].innerHTML).to.be.equal('White cold drink')
    tag2.unmount()

  })

  it('still loops with reserved property names #1526', function() {
    injectHTML('<reserved-names></reserved-names>')
    var tag = riot.mount('reserved-names')[0]
    tag.reorder()
    tag.update()
    tag.reorder()
    tag.update()
    tag.unmount()
  })

  it('named elements in object key loop do not duplicate', function() {

    injectHTML('<obj-key-loop></obj-key-loop>')

    var tag = riot.mount('obj-key-loop')[0]

    expect(tag.x.value).to.be.equal('3')
    expect(tag.y.value).to.be.equal('44')
    expect(tag.z.value).to.be.equal('23')

    tag.update()
    expect(tag.x.value).to.be.equal('3')
    expect(tag.y.value).to.be.equal('44')
    expect(tag.z.value).to.be.equal('23')

    tag.unmount()
  })

  it('non looped and conditional virtual tags mount content', function() {
    injectHTML('<virtual-no-loop></virtual-no-loop>')
    var tag = riot.mount('virtual-no-loop')[0]

    var virts = tag.root.querySelectorAll('virtual')
    expect(virts.length).to.be.equal(0)

    var spans = tag.root.querySelectorAll('span')
    var divs = tag.root.querySelectorAll('div')
    expect(spans.length).to.be.equal(2)
    expect(divs.length).to.be.equal(2)
    expect(spans[0].innerHTML).to.be.equal('if works text')
    expect(divs[0].innerHTML).to.be.equal('yielded text')
    expect(spans[1].innerHTML).to.be.equal('virtuals yields expression')
    expect(divs[1].innerHTML).to.be.equal('hello there')

    tag.unmount()
  })

  it('virtual tags with yielded content function in a loop', function() {
    injectHTML('<virtual-yield-loop></virtual-yield-loop>')
    var tag = riot.mount('virtual-yield-loop')[0]
    var spans = tag.root.querySelectorAll('span')

    expect(spans[0].innerHTML).to.be.equal('one')
    expect(spans[1].innerHTML).to.be.equal('two')
    expect(spans[2].innerHTML).to.be.equal('three')

    tag.items.reverse()
    tag.update()

    spans = tag.root.querySelectorAll('span')

    expect(spans[0].innerHTML).to.be.equal('three')
    expect(spans[1].innerHTML).to.be.equal('two')
    expect(spans[2].innerHTML).to.be.equal('one')

    tag.unmount()
  })
/*
  TODO: there seem to be still some problem in the loops properties inheritance
  it('parallel nested loop remove without error', function(done) {
    injectHTML('<nested-parallel-loop></nested-parallel-loop>')
    var tag = riot.mount('nested-parallel-loop', {items: [
      {
        type: 'rightsExpiration',
        accountBased: false,
        items: [
          {channel: 'email', value: 'some@email.com'},
          {channel: 'phone', value: '+1111111111'}
        ]
      },
      {
        type: 'accountWithdrawal',
        accountBased: true,
        items: [
          {
            'account1': [
              {channel: 'email', value: 'some@email.com'},
              {channel: 'email', value: 'some2@email.com'}
            ]
          }
        ]
      }
    ]})[0]

    tag.on('mount', function() {
      setTimeout(function() {
        console.log(tag.tags['nested-parallel-loop-group'][0].tags)
        tag.tags['nested-parallel-loop-group'][0].tags['nested-parallel-loop-simple'][0].del.click()
        var simples = tag.root.querySelectorAll('nested-parallel-loop-simple')
        expect(tag.items[0].items.length).to.be.equal(1)
        expect(simples.length).to.be.equal(1)
        tag.unmount()
        done()
      }, 0)
    })
  })*/

})
