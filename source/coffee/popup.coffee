$ ->
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

  $('body')
    .delegate 'a', 'click', (e) ->
      chrome.tabs.create
        url: $(e.target).parents('a').attr('href')
        active: true

  chrome.extension.sendRequest 'click', (content) ->
    console.log content
    $ol.html(content)
