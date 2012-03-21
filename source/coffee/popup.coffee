$ ->
  for menu in ['notifications', 'following', 'all_posts']
    do (menu) ->
      $(".menu > .#{menu}")
        # i18n of menu
        .html(chrome.i18n.getMessage(menu))
        # add click event handler
        .click ->
          $('.menu > .active').removeClass('active')
          $(this).addClass 'active'
          $('#contents > .active').removeClass('active')
          $("#contents > .#{menu}").addClass('active')
          chrome.extension.sendRequest(
            {action: 'click', menu: menu}
            (content) ->
              $("#contents > .#{menu} > ol").html(content)
          )

      chrome.extension.sendRequest(
        {action: 'getUnreadCount', menu: menu}
        (count) ->
          if count > 0
            $menu = $(".menu > .#{menu}")
            $menu.html("#{$menu.text()} (#{count})")
      )

  $('.menu > .notifications').trigger('click')
