$ ->
  for menu in ['notifications', 'following', 'all_posts']
    do (menu) ->
      $(".menu > .#{menu}")
        # i18n
        .html(chrome.i18n.getMessage(menu))
        # set click event handler
        .click ->
          $('.menu > .active').removeClass('active')
          $(this).addClass 'active'
          $('#contents > .active').removeClass('active')
          $("#contents > .#{menu}").addClass('active')
          chrome.extension.sendRequest {action: 'click', menu: menu}
                                     , (content) =>
            $("#contents > .#{menu} > ol").html(content)

  $('.menu > .notifications').trigger('click')
