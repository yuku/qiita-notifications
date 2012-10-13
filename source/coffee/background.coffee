q = @qiita

DOMAIN = q.DOMAIN

# Backbone

q.b = badge = new Backbone.Model

_.extend badge,
  defaults:
    count: 0
  url: "#{DOMAIN}/api/notifications/count"

badge.bind 'change:count', ->
  prev = @previous 'count'
  curr = @get 'count'
  if prev isnt curr
    if curr is null
      text = '?'
      color = [100, 100, 100, 100]
    else if curr is 0
      text = '0'
      color = [100, 100, 100, 255]
    else
      text = curr.toString()
      color = [204, 60, 41, 255]
    chrome.browserAction.setBadgeText text: text
    chrome.browserAction.setBadgeBackgroundColor color: color

    @trigger 'increment', curr - prev if prev < curr

badge.bind 'increment', (count) ->
  notifications.fetch
    success: ->
      notifications.notify count

q.n = notifications = new Backbone.Collection
_.extend notifications,
  url: "#{DOMAIN}/api/notifications"
  notify: (count) ->
    q.logger.debug 'Notifications#notify'
    if settingManager.get 'notifyNotifications'
      time = settingManager.get 'notifyTime'
      @models[0...count].forEach (model, i) ->
        notification = window.webkitNotifications.createNotification(
          model.get('users')[0].profile_image_url
          ''
          chrome.i18n.getMessage(
            model.get('action')
            (user.display_name for user in model.get('users')).join(', ')
          ).replace(/<[^>]*>/g, ' ').replace('  ', ' ')
        )
        notification.show()
        if time > 0
          setTimeout(
            -> notification.cancel()
            (i + 1) * time * 1000
          )
  readAll: ->
    @each (model) -> model.set('seen', true)
    $.get "#{DOMAIN}/api/notifications/read"
    badge.set 'count', 0
  getCount: -> badge.get 'count'


Item = Backbone.Model.extend
  defaults:
    seen: true

Items = Backbone.Collection.extend
  initialize: ->
    @bind 'reset', =>
      if @max_id is Infinity and @read_max_id is Infinity
        @count = 0
        @read_max_id = @max_id = @max((model) -> model.id).id
      else
        @count = @filter((model) => model.id > @read_max_id).length
        new_item_count = @filter((model) => model.id > @max_id).length
        @models[0...@count].forEach (model) -> model.set 'seen', false
        @notify new_item_count if new_item_count > 0
        @max_id = @max((model) -> model.id).id
  model: Item
  max_id: Infinity
  read_max_id: Infinity
  count: 0
  notify: (count) ->
    q.logger.debug "#{@cls}#notify"
    if settingManager.get "notify#{@cls}"
      time = settingManager.get 'notifyTime'
      @models[0...count].forEach (model, i) =>
        notification = @createNotification(model)
        notification.show()
        if time > 0
          setTimeout(
            -> notification.cancel()
            (i + 1) * time * 1000
          )
  readAll: ->
    @each (model) -> model.set('seen', true)
    @read_max_id = @max_id
    @count = 0
  getCount: -> @count

q.f = following = new Items
_.extend following,
  url: "#{DOMAIN}/following"
  cls: 'Following'
  createNotification: (model) ->
    action_type = model.get('action_type')
    actor = model.get('actor')
    if action_type is 'following_tag_post'
      url = "#{DOMAIN}/#{actor.iconUrl}"
      title = chrome.i18n.getMessage("desktop_notification__#{action_type}", actor.name)
      content = model.get('target_content').title
    else
      if action_type is 'own_post'
        action_type = 'post'
      url = actor.profile_image_url
      title = chrome.i18n.getMessage("desktop_notification__#{action_type}", actor.display_name)
      content = model.get('target_content').title

    window.webkitNotifications.createNotification(url, title, content)

q.a = all_posts = new Items
_.extend all_posts,
  url: "#{DOMAIN}/public"
  cls: 'AllPosts'
  createNotification: (model) ->
    window.webkitNotifications.createNotification(
      model.get('user').profile_image_url
      model.get('title')
      model.get('tags').map((tag) -> "##{tag.name}").join(' ')
    )

settingManager =
  defaults:
    'notifyNotifications' : true
    'notifyFollowing'     : true
    'notifyAllPosts'      : false
    'notifyTime'          : 2
    'token'               : null
    'url_name'            : null

  getAll: ->
    res = {}
    res[name] = @get name for name of @defaults
    res

  get: (name) ->
    q.logger.debug "get:#{name}"
    if localStorage[name]?
      JSON.parse localStorage.getItem name
    else
      @defaults[name]

  set: (name, value) ->
    q.logger.debug "set:#{name}", JSON.stringify value
    localStorage.setItem name, JSON.stringify value

getCollection = (menu) ->
  if menu is 'notifications'
    return notifications
  else if menu is 'following'
    return following
  else if menu is 'all_posts'
    return all_posts


chrome.extension.onRequest.addListener (req, sender, res) ->
  collection = getCollection req.menu
  if req.action is 'click'
    res collection
  else if req.action is 'read'
    collection.readAll()
  else if req.action is 'getUnreadCount'
    res collection.getCount()
  else if req.action is 'settings'
    switch req.type
      when 'set'
        settingManager.set req.name, req.value
      when 'get'
        if req.name is 'all'
          getAll = settingManager.getAll()
          q.logger.debug 'getAll', getAll
          res(getAll)
        else
          get = settingManager.get req.name
          q.logger.debug "get:#{req.name}", get
          res(get)


$ ->
  update = ->
    q.logger.debug 'update'
    badge.fetch(
      error: -> badge.set 'count', null
    )
    following.fetch(
      error: -> following.reset()
    )
    all_posts.fetch(
      error: -> all_posts.reset()
    )
  setInterval(
    update
    60 * 1000
  )

  # initialize
  update()
  notifications.fetch()
