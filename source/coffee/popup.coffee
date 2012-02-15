$ ->
  $ol = $('ol#notification-list')

  chrome.extension.sendRequest action: 'click', (content) ->
    $ol.html(content)
