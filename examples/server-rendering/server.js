var fs = require('fs')
var express = require('express')
var riot = require('riot').install()

var app = express()
app.engine('html', riot.renderFile)
app.use(express.static('public'))

require('riot/test/tag/timer.tag')

app.get('/', function(req, res) {
  res.render('index.html')
})

var server = app.listen(3000, function() {
  console.log('Riot server app listening at http://localhost:%s', server.address().port)
})
