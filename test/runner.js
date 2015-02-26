
var isNode = typeof window === 'undefined'

describe('Riotjs tests', function() {
  if (isNode) {

    global.compiler = require('../lib/compiler')
    global.expect = require('expect.js')
    require('./specs/compiler-cli')

  } else {
    mocha.run()
  }
})