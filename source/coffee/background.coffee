checkCount = ->
  $.getJSON 'http://qiita.com/api/notifications/count'
          , (data) ->
    updateIcon data.count or 0

updateIcon = (count) ->
  chrome.browserAction.setBadgeText text: count.toString()
  color = if count is 0 then [100, 100, 100, 255] else [204, 60, 41, 255]
  chrome.browserAction.setBadgeBackgroundColor color: color


do ->
  checkCount()
  setInterval(
    -> checkCount()
    1000 * 60 * 10
  )
