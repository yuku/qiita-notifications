# cache
count = null
contents = null
templates = {}


# underscore
_.templateSettings = 
  interpolate: /\{\{(.+?)\}\}/g
  evaluate: /\{%(.+?)%\}/g
  escape: /\{%-(.+?)%\}/g


class Cache
  # ttl: time to live
  constructor: (@ttl, @reflesh) ->
    @last = null
    @value = null

  get: ->
    if @last is null or Date.now() - @last > @ttl
      # update the value
      @last = Date.now()
      @reflesh()
    else
      @value


parseContentsData = (contentsData) ->
  parseRow = (row) ->
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
    _.template templates.notification, data
  (parseRow(row) for row in contentsData).join('')


checkCount = ->
  $.when(count.get())
    .done((count) ->
      chrome.browserAction.setBadgeText text: count.toString()
      color = if count is 0 then [100, 100, 100, 255] else [204, 60, 41, 255]
      chrome.browserAction.setBadgeBackgroundColor color: color
    )
    .fail(->
      chrome.browserAction.setBadgeText text: '-'
      chrome.browserAction.setBadgeBackgroundColor color: [100, 100, 100, 255]
    )


chrome.extension.onRequest.addListener (req, sender, res) ->
  if req.action is 'click'
    $.when(contents.get())
      .done((data) ->
        chrome.browserAction.setBadgeText text: '0'
        chrome.browserAction.setBadgeBackgroundColor color: [100, 100, 100, 255]
        res(parseContentsData(data))
      )
      .fail(->
        res(templates.login_required)
      )


$ ->
  # initialize cache objects
  contents = new Cache(
    1000 * 60
    ->
      dfd = $.Deferred()
      $.ajax 'http://qiita.com/api/notifications'
        success: (data, status, jqXHR) =>
          @value = data
          $.get 'http://qiita.com/api/notifications/read' # call read api
          dfd.resolve(@value)
        error: ->
          dfd.reject()
        dataType: 'json'
      return dfd
  )
  count = new Cache(
    1000 * 60
    ->
      dfd = $.Deferred()
      $.ajax 'http://qiita.com/api/notifications/count',
        success: (data, status, jqXHR) =>
          @value = data.count
          dfd.resolve(@value)
        error: ->
          dfd.reject()
        dataType: 'json'
      return dfd
  )
  templates.notification = $('#list').html()
  templates.login_required = $('#login-required').html()
  for id in ['follow_user', 'update_posted_chunk', 'increment', 'stock']
    templates[id] = $("##{id}").html()

  checkCount()

  setInterval(
    -> checkCount()
    1000 * 150
  )
