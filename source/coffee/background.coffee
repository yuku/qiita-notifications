q = @qiita
q.LOG_LEVEL = q.logLevels.DEBUG

DOMAIN = 'https://qiita.com'

# Backbone

Info = Backbone.Model.extend()

Notifications = Backbone.Collection.extend
  initialize: ->
    @fetch()
    @update()
  model: Info
  url: "#{DOMAIN}/api/notifications"
  count: 0
  update: ->
    $.ajax "#{DOMAIN}/api/notifications/count",
      success: (data, status, jqXHR) =>
        prev = @count
        @count = data.count
        color = if @count is 0 then [100, 100, 100, 255] else [204, 60, 41, 255]
        chrome.browserAction.setBadgeText text: @count.toString()
        chrome.browserAction.setBadgeBackgroundColor color: color
        if (diff = @count - prev) > 0
          $.when(@fetch()).done( => @notify diff).fail( => @reset())
      error: ->
        chrome.browserAction.setBadgeText text: '?'
        chrome.browserAction.setBadgeBackgroundColor color: [100, 100, 100, 255]
      dataType: 'json'
  notify: (count) ->
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
    @count = 0
    chrome.browserAction.setBadgeText text: '0'
    chrome.browserAction.setBadgeBackgroundColor color: [100, 100, 100, 255]

Item = Backbone.Model.extend(
  defaults:
    seen: true
)

Items = Backbone.Collection.extend
  initialize: -> @update()
  model: Item
  max_id: Infinity
  read_max_id: Infinity
  count: 0
  update: ->
    $.when(@fetch())
      .done((data) =>
        @count = _.filter(data, (d) => d.id > @read_max_id).length
        data[0...@count].forEach((d) -> d.seen = false)
        @notify _.filter(data, (d) => d.id > @max_id).length
        @max_id = _.max(data, (d) -> d.id).id
      )
      .fail( => @reset())
  notify: (count) ->
    if settingManager.get "notify#{@cls}"
      time = settingManager.get 'notifyTime'
      @models[0...count].forEach (model, i) ->
        notification = window.webkitNotifications.createNotification(
          model.get('user').profile_image_url
          model.get('title')
          model.get('tags').map((tag) -> "##{tag.name}").join(' ')
        )
        notification.show90
        if time > 0
          setTimeout(
            -> notification.cancel()
            (i + 1) * time * 1000
          )
  readAll: ->
    @each (model) -> model.set('seen', true)
    @count = 0

Following = Items.extend(url: "#{DOMAIN}/following", cls: 'Following')
AllPosts   = Items.extend(url: "#{DOMAIN}/public", cls: 'AllPosts')

settingManager =
  defaults:
    'notifyNotifications'     : true
    'notifyFollowing'         : true
    'notifyAllPosts'          : false
    'notifyTime'      : 2

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
    localStorage.setItem name, JSON.stringify value


$ ->
  collections =
    notifications: new Notifications
    following: new Following
    all_posts: new AllPosts

  setInterval(
    ->
      collection.update() for collection in collections
    3 * 60 * 1000
  )

  chrome.extension.onRequest.addListener (req, sender, res) ->
    if req.action is 'click'
      collection = collections[req.menu]
      collection.readAll()
      res collection
    else if req.action is 'getUnreadCount'
      res collections[req.menu].count
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
