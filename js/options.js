(function ($) {

  'use strict';

  $('input').setting({ auto_save: true });
  $('select').setting({ auto_save: true });

  $('.tab').click(function () {
    var $this = $(this);
    var id = $this.data('id');
    $('.tab.active').removeClass('active');
    $('#content .active').removeClass('active');
    $this.addClass('active');
    $('#content .' + id).addClass('active');
  });

  $($('.tab')[0]).click();

})(jQuery);
