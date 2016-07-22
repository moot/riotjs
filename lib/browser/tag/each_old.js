import {
  T_STRING,
  T_OBJECT,
  __TAG_IMPL,
  RE_SPECIAL_TAGS,
  FIREFOX
} from './../common/global-variables'

import {
  isSpecialTag,
  isString,
  isArray,
  remAttr,
  getAttr,
  getTagName,
  getTag,
  arrayishAdd,
  arrayishRemove,
  defineProperty,
  getOuterHTML,
  moveChildTag,
  each,
  makeVirtual,
  moveVirtual,
  mkitem,
  moveNestedTags,
  unmountRedundant
} from './../common/util'

import { tmpl } from 'riot-tmpl'
import Tag from './tag'

/**
 * Manage tags having the 'each'
 * @param   { Object } dom - DOM node we need to loop
 * @param   { Tag } parent - parent tag instance where the dom node is contained
 * @param   { String } expr - string contained in the 'each' attribute
 * @returns { Object } expression object for this each loop
 */
export default function _each(dom, parent, expr) {
  // remove the each property from the original tag
  remAttr(dom, 'each')

  const mustReorder = !isString(getAttr(dom, 'no-reorder')) || remAttr(dom, 'no-reorder'),
    tagName = getTagName(dom),
    impl = __TAG_IMPL[tagName] || { tmpl: getOuterHTML(dom) },
    useRoot = isSpecialTag(tagName),
    ref = document.createTextNode(''),
    child = getTag(dom),
    isOption = tagName.toLowerCase() === 'option', // the option tags must be treated differently
    tags = [],
    isVirtual = dom.tagName == 'VIRTUAL'

  let root = dom.parentNode,
    oldItems = [],
    hasKeys

  expr = tmpl.loopKeys(expr)
  expr.isLoop = true

  // parse the each expression
  const ifExpr = getAttr(dom, 'if')
  if (ifExpr)
    remAttr(dom, 'if')

  // insert a marked where the loop tags will be injected
  root.insertBefore(ref, dom)
  root.removeChild(dom)

  expr.update = function updateEach() {
    // get the new items collection
    var items = tmpl(expr.val, parent),
      // create a fragment to hold the new DOM nodes to inject in the parent tag
      frag = document.createDocumentFragment()
    root = ref.parentNode

    // object loop. any changes cause full redraw
    if (!isArray(items)) {
      hasKeys = items || false
      items = hasKeys ?
        Object.keys(items).map(function (key) {
          return mkitem(expr, key, items[key])
        }) : []
    }

    if (ifExpr) {
      items = items.filter(function(item, i) {
        var context = mkitem(expr, item, i, parent)
        return !!tmpl(ifExpr, context)
      })
    }

    // loop all the new items
    items.forEach(function(item, i) {
      // reorder only if the items are objects

      var
        _mustReorder = mustReorder && typeof item == T_OBJECT && !hasKeys,
        oldPos = oldItems.indexOf(item),
        pos = ~oldPos && _mustReorder ? oldPos : i,
        // does a tag exist in this position?
        tag = tags[pos], domToInsert

      item = !hasKeys && expr.key ? mkitem(expr, item, i) : item

      // new tag
      if (
        !_mustReorder && !tag // with no-reorder we just update the old tags
        ||
        _mustReorder && !~oldPos || !tag // by default we always try to reorder the DOM elements
      ) {

        tag = new Tag(impl, {
          parent,
          isLoop: true,
          anonymous: !__TAG_IMPL[tagName],
          root: useRoot ? root : dom.cloneNode(),
          item
        }, dom.innerHTML)

        tag.mount()
        domToInsert = tag.root
        // this tag must be appended
        if (i == tags.length) {
          if (isVirtual)
            makeVirtual(tag, frag)
          else frag.appendChild(domToInsert)
        }
        // this tag must be insert
        else {
          if (isVirtual)
            makeVirtual(tag, root, tags[i])
          else root.insertBefore(domToInsert, tags[i].root)
          oldItems.splice(i, 0, item)
        }

        tags.splice(i, 0, tag)
        if (child) arrayishAdd(parent.tags, tagName, tag, true)
        pos = i // handled here so no move
      } else tag.update(item)

      // reorder the tag if it's not located in its previous position
      if (pos !== i && _mustReorder) {
        // update the DOM
        if (isVirtual)
          moveVirtual(tag, root, tags[i])
        else root.insertBefore(tag.root, tags[i].root)
        // update the position attribute if it exists
        if (expr.pos)
          tag[expr.pos] = i
        // move the old tag instance
        tags.splice(i, 0, tags.splice(pos, 1)[0])
        // move the old item
        oldItems.splice(i, 0, oldItems.splice(pos, 1)[0])
        // if the loop tags are not custom
        // we need to move all their custom tags into the right position
        if (!child && tag.tags) moveNestedTags(tag, i)
      }

      // cache the original item to use it in the events bound to this node
      // and its children
      tag._item = item
      // cache the real parent tag internally
      defineProperty(tag, '_parent', parent)

    })

    // remove the redundant tags
    unmountRedundant(items, tags, tagName, parent)

    // insert the new nodes
    root.insertBefore(frag, ref)
    if (isOption) {

      // #1374 FireFox bug in <option selected={expression}>
      if (FIREFOX && !root.multiple) {
        for (var n = 0; n < root.length; n++) {
          if (root[n].__riot1374) {
            root.selectedIndex = n  // clear other options
            delete root[n].__riot1374
            break
          }
        }
      }
    }

    // clone the items array
    oldItems = items.slice()
  }

  expr.unmount = function() {
    each(tags, t => t.unmount())
  }

  return expr
}
