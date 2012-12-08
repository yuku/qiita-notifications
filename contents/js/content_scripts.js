$.fn.caretPos = function () {
  'use strict';
  this.focus();
  return this[0].selectionStart;
};


$(function () {

  'use strict';

  var $a = $('<a href="#">リンクを挿入</a>');
  var $textarea = $('textarea.content-area');

  $a.click(function () {
    var url = prompt('URL: ', '');
    if (!url) return;
    $(this).removeClass('active');
    $.ajax({
      url: url,
      dataType: 'text'
    }).done(function (data) {
      var match = data.match(/<title>([^<]*)<\/title>/);
      var title = match ? match[1] : '';
      var txt = '[' + title + '](' + url + ')';
      $textarea.focus();
      var str = $textarea.val();
      var pos = $textarea[0].selectionStart;
      var np = pos + txt.length;
      $textarea.val(str.substr(0, pos) + txt + str.substr(pos));
      $textarea[0].setSelectionRange(np, np);
    }).fail(function () {
      alert("Fail: " + url);
    });
  });

  $('<li></li>').append($a).appendTo($('.edit-preview-tabs'));

});
