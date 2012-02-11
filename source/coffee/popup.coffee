$ ->
  _.templateSettings = 
    interpolate: /\{\{(.+?)\}\}/g
    evaluate: /\{%(.+?)%\}/g
    escape: /\{%-(.+?)%\}/g

  templates = {}
  for id in ['follow_user', 'update_posted_chunk', 'increment', 'stock']
    templates[id] = $("##{id}").html()

  list = $("#list").html()
  $ol = $('ol#notification-list')

  insertNotification = (action, object, created_at, seen, users) ->
    content = _.template templates[action]
                       , names: (user.display_name for user in users).join ', '
    data = 
      action: action
      object: object
      created_at: created_at
      image_url: users[0].profile_image_url
      name: users[0].url_name
      seen: seen
      content: content
    $ol.append($(_.template(list, data)))

  console.log 'hoge'

  $('body')
    .delegate 'a', 'click', (e) ->
      chrome.tabs.create
        url: $(e.target).parents('a').attr('href')
        active: true

  $.getJSON('http://qiita.com/api/notifications')
    .success (data, textStatus) ->
      for row in data
        insertNotification row.action, row.object, row.created_at, row.seen, row.users
