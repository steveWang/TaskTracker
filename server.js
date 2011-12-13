var express = require('express');
var app = express.createServer();
app.use(express.static( __dirname + '/public'));
var nowjs = require('now');
var everyone = nowjs.initialize(app);
app.listen(process.argv[2] || 8080);
// load tasks database
var db = {};

var dbStream = require('fs').createWriteStream('./tasks.db', {flags: 'a'});

require('fs').readFile('./tasks.db', function (err, data) {
  if (err) throw err;
  data = data.toString();
  if (data) {
    data.split('\n').forEach(function (el) {
      var pair = el.split('\t');
      if (pair.length == 3) {
        db[pair[0]] = {text: pair[1], done: pair[2]};
      }
    });
  }
});

everyone.now.addTask = function (start, text) {
  db[start] = {text: text, done: '0'};
  dbStream.write([start, text, 0].join('\t')+'\n');
};

everyone.now.completeTask = function (start, time) {
  db[start].done = time;
  dbStream.write([start, db[start].text, time].join('\t')+'\n');
};

everyone.now.fetchTasks = function () {
  for (var i = 0, keys = Object.keys(db), ll = keys.length; i < ll; i++) {
    var key = keys[i];
    var task = db[key];
    this.now.receiveTask(key, task.text, task.done);
  }
};
