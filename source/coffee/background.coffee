# cache
count = null
contents = null
latest_id = 
  following: 0
  all_posts: 0
unread_count =
  notifications: 0
  following: 0
  all_posts: 0
templates = {}


# underscore
_.templateSettings = 
  interpolate: /\{\{(.+?)\}\}/g
  evaluate: /\{%(.+?)%\}/g
  escape: /\{%-(.+?)%\}/g


parseNotificationData = (notifications) ->
  parseRow = (row) ->
    content = chrome.i18n.getMessage(row.action,
      (user.display_name for user in row.users).join ', ')
    data = 
      action: row.action
      object: row.object
      created_at: row.created_at
      image_url: row.users[0].profile_image_url
      name: row.users[0].url_name
      seen: row.seen
      content: content
    _.template templates.notification, data
  (parseRow(row) for row in notifications).join('')


parseChunkData = (chunks, menu) ->
  is_first = latest_id[menu] is 0
  max_id = 0
  parseRow = (row) ->
    data = {}
    max_id = row.id if max_id < row.id
    if latest_id[menu] < row.id
      if is_first
        data.seen = true
        latest_id[menu] = row.id 
      else
        data.seen = false
    else
      data.seen = true
    for own key, value of row
      data[key] = value
    _.template(templates.chunk, data)
  html = (parseRow(row) for row in chunks).join('')
  latest_id[menu] = max_id
  html


showNotificationData = (data) ->
  data
    .forEach((d, i) ->
      notify = window.webkitNotifications.createNotification(
        d.users[0].profile_image_url
        ''
        chrome.i18n.getMessage(
          d.action
          (user.display_name for user in d.users).join(', ')
        ).replace(/<[^>]*>/g, ' ').replace('  ', ' ')
      )
      notify.show()
      setTimeout(
        ->
          notify.cancel()
        (i + 3) * 1000
      )
    )


showChunkData = (data) ->
  data
    .forEach((d) ->
      window.webkitNotifications.createNotification(
        d.user.profile_image_url
        d.title
        d.tags.map((tag) -> "##{tag.name}").join(' ')
      ).show()
    )


checkCount = ->
  $.when(count.get())
    .done((data) ->
      chrome.browserAction.setBadgeText text: data.count.toString()
      color = if data.count is 0 then [100, 100, 100, 255] else [204, 60, 41, 255]
      # show webNotifications
      new_count = data.count - unread_count.notifications
      if new_count > 0
        $.when(contents.notifications.get())
          .done((data) ->
            showNotificationData(data[0...new_count])
          )
      unread_count.notifications = data.count
      chrome.browserAction.setBadgeBackgroundColor color: color
    )
    .fail(->
      chrome.browserAction.setBadgeText text: '-'
      chrome.browserAction.setBadgeBackgroundColor color: [100, 100, 100, 255]
    )
  for menu in ['following', 'all_posts']
    $.when(contents[menu].get())
      .done((chunks) ->
        unread_count[menu] =
          if latest_id[menu] isnt 0
            [row for row in chunks when latest_id[menu] < row.id].length
          else
            0
      )


readAll = (menu) ->
  content.seen = true for content in contents[menu].value
  unread_count[menu] = 0


chrome.extension.onRequest.addListener (req, sender, res) ->
  if req.action is 'click'
    $.when(contents[req.menu].get())
      .done((data) ->
        if req.menu is 'notifications'
          chrome.browserAction.setBadgeText text: '0'
          chrome.browserAction.setBadgeBackgroundColor color: [100, 100, 100, 255]
          res(parseNotificationData(data))
          $.get('http://qiita.com/api/notifications/read') # call read api
          readAll(req.menu)
        else
          res(parseChunkData(data, req.menu))
      )
      .fail(->
        content = chrome.i18n.getMessage('login_required')
        res(_.template(templates.login_required, {content: content}))
      )
  if req.action is 'getUnreadCount' and req.menu of unread_count
    res(unread_count[req.menu])


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


cacheFactory = (pathname, ttl) ->
  new Cache(
    ttl or 1000 * 60
    ->
      dfd = $.Deferred()
      $.ajax "http://qiita.com#{pathname}",
        success: (data, status, jqXHR) =>
          @value = data
          dfd.resolve(@value)
        error: ->
          dfd.reject()
        dataType: 'json'
      return dfd
  )


$ ->
  # initialize cache objects
  contents =
    notifications: cacheFactory('/api/notifications')
    following: cacheFactory('/following')
    all_posts: cacheFactory('/public')
  count = cacheFactory('/api/notifications/count')
  templates.notification = $('#notification').html()
  templates.chunk = $('#chunk').html()
  templates.login_required = $('#login-required').html()
  for id in ['follow_user', 'update_posted_chunk', 'increment', 'stock', 'reply']
    templates[id] = $("##{id}").html()

  checkCount()

  setInterval(
    checkCount
    1000 * 150
  )
