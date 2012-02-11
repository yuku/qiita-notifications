# cache
CONTENTS = null
COUNT = 0

# underscore
_.templateSettings = 
  interpolate: /\{\{(.+?)\}\}/g
  evaluate: /\{%(.+?)%\}/g
  escape: /\{%-(.+?)%\}/g

templates = {}
list_template = null

build = (row) ->
  content = _.template templates[row.action]
                      , names: (user.display_name for user in row.users).join ', '
  data = 
    action: row.action
    object: row.object
    created_at: row.created_at
    image_url: row.users[0].profile_image_url
    name: row.users[0].url_name
    seen: row.seen
    content: content
  _.template list_template, data

getContents = ->
  CONTENTS or $.getJSON 'http://qiita.com/api/notifications', (data) ->
                CONTENTS = (build(row) for row in data).join('')

# call read api
read = -> $.get 'http://qiita.com/api/notifications/read'


checkCount = ->
  $.getJSON 'http://qiita.com/api/notifications/count'
          , (data) ->
    updateIcon data.count or 0


updateIcon = (count) ->
  COUNT = count
  chrome.browserAction.setBadgeText text: count.toString()
  color = if count is 0 then [100, 100, 100, 255] else [204, 60, 41, 255]
  chrome.browserAction.setBadgeBackgroundColor color: color


RequestHandler = (req, sender, res) ->
  ClickReqHandler(res) if req is 'click'

ClickReqHandler = (res) ->
  if COUNT > 0
    CONTENTS = null  # cache clear
    $.when(getContents(), read())
      .done () ->
        updateIcon(0)
        res(CONTENTS)
  else
    $.when(getContents())
      .done () ->
        res(CONTENTS)

chrome.extension.onRequest.addListener RequestHandler

$ ->
  for id in ['follow_user', 'update_posted_chunk', 'increment', 'stock']
    templates[id] = $("##{id}").html()
  list_template = $("#list").html()

  #getContents() # create cache

  checkCount()
  setInterval(
    -> checkCount()
    1000 * 60
  )
