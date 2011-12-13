var ip; // in progress

// Doesn't make sense to load a whole new script, just for this...

/*
 * JavaScript Pretty Date
 * Copyright (c) 2011 John Resig (ejohn.org)
 * Licensed under the MIT and GPL licenses.
 */

// Takes an ISO time and returns a string representing how
// long ago the date represents.
function prettyDate(time){
  var diff = (Date.now() - time) / 1000,
      day_diff = Math.floor(diff / 86400);

  if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 )
    return undefined;

  return day_diff == 0 && (
    diff < 60 && "just now" ||
      diff < 120 && "1 minute ago" ||
      diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
      diff < 7200 && "1 hour ago" ||
      diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
    day_diff == 1 && "Yesterday" ||
    day_diff < 7 && day_diff + " days ago" ||
    day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago";
}

function nextRefresh(time) {
  var diff = (Date.now() - time) / 1000;
  var day_diff = Math.floor(diff / 86400);
  return diff < 3600 ? diff % 60 : diff < 86400 ? diff % 3600 : diff % 86400;
}

function timeHue(diff, limit) {
  var alpha = 100;
  // TODO: Linear, for now. Fix.
  return 120 - (Math.min(diff, limit) / limit) * 120;
}

function timeColor(diff) {
  const limit = 6*3600*1000;
  var chroma = .75,
      hue = timeHue(diff, limit),
      hprime = hue / 60;
  var x = chroma*(1-Math.abs(hprime%2 - 1));
  chroma = Math.round(chroma*256).toString(16);
  x = Math.round(x*256).toString(16);
  if (chroma.length - 2) chroma = '0' + chroma;
  if (x.length - 2) x = '0' + x;
  if (hprime < 1) return '#' + chroma + x + '00';
  return '#' + x + chroma + '00';
}

function timer(el, time, refresh, index) {
  setTimeout(function () {
    var c = $(el.e.find('.time')[index]);
    c.text(prettyDate(time));
    if (ip.find(el.e).length) {
      var color = timeColor(Date.now() - time);
      c.css('color', color);
    }
    timer(el, time, nextRefresh(time), index);
  }, refresh*1000);
}

function diffFormat(diff) {
  var s = Math.floor(diff / 1000),
      m = Math.floor(s / 60),
      h = Math.floor(m / 60),
      d = Math.floor(h / 24);
  var largest = d || h || m || s;
  var str = '';
  switch (largest) {
  case 0:
    str = '0s';
    break;
  case d:
    str += d + 'd ';
  case h:
    str += h%24 + 'h ';
  case m:
    str += m%60 + 'm ';
  case s:
    str += s%60 + 's ';
  }
  return str;
}

function complete(el, time) {
  el.e.unbind('dblclick');
  el.e.remove();
  el.e.find('.time').css('color', '');
  el.e.append('<br/><span class="info">time to complete: ' + diffFormat(time - el.start));
  el.e.prependTo($('.completed'));
  timer(el, time, 0, 1);
}

$(document).ready(function () {
  ip = $('.ip');
  $('#submit').click(function () {
    var time = Date.now();
    now.addTask(time, $('textarea').val());
    now.receiveTask(time, $('textarea').val(), '0');
  });
});

now.receiveTask = function (start, task, done) {
  $('.ip').prepend('<li><span class="info">Added <span class="time">just now</span></span>:<br/> ' + task + '</li>');
  var el = {e: $('.ip').children().first(), start: start};
  el.e.dblclick(function () {
    var bool = confirm('Did you really complete this task?');
    if (bool) {
      var time = Date.now();
      complete(el, time);
      now.completeTask(start, time);
    }
  });
  timer(el, start, 0, 0);
  $('textarea').val('');
  if (done !== '0') {
    // Force this to execute after the setTimeout in timer executes.
    setTimeout(function () {
      complete(el, done);
    }, 0);
  }
};

now.ready(function () {
  now.fetchTasks();
});

