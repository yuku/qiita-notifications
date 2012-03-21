count =
  following: 0
  all_posts: 0

chrome.extension.onRequest.addListener (req, sender, res) ->
  if req.action is 'count'
    count[req.menu] = req.count


$ ->
  for menu in ['notifications', 'following', 'all_posts']
    do (menu) ->
      # i18n of menu
      menu_html = chrome.i18n.getMessage(menu)
      if menu in count and count[menu] > 0
        menu_html = "#{menu_html}(#{count[menu]})"
      $(".menu > .#{menu}")
        .html(menu_html)
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
