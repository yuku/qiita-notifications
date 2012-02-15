$ ->
  for menu in ['notifications', 'following', 'all-posts']
    do (menu) ->
      $(".menu > .#{menu}")
        .click ->
          $('.menu > .active').removeClass('active')
          $(this).addClass 'active'
          $('#contents > .active').removeClass('active')
          $("#contents > .#{menu}").addClass('active')
          chrome.extension.sendRequest {action: 'click', menu: menu}
                                     , (content) =>
            $("#contents > .#{menu} > ol").html(content)

  $('.menu > .notifications').trigger('click')
