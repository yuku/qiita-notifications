$ ->
  $ol = $('ol#notification-list')

  $('body')
    .delegate 'a', 'click', (e) ->
      $a = if e.target.tagName is 'A' then $(e.target) else $(e.target).parents('a')
      chrome.tabs.create
        url: $a.attr('href')
        active: true

  chrome.extension.sendRequest 'click', (content) ->
    $ol.html(content)
