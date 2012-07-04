q = @qiita

InfoView = Backbone.View.extend
  render: ->
    content = chrome.i18n.getMessage(
      @model.action
      (user.display_name for user in @model.users).join(', ')
    )
    alt = @model.users[0].display_name
    src = @model.users[0].profile_image_url
    cls = unless @model.seen then 'unread' else ''
    """
    <li class='notification #{cls}'>
      <a href='#{@model.object}' target='_blank'>
        <div class='box'>
          <div class='left'>
            <div class='user-icon'>
              <img class='icon-m' src='#{src}' alt='#{alt}'>
            </div>
          </div>
          <div class='right'>
            <div class='content'>#{content}</div>
            <div class='status'>
              <span class='#{@model.action}'>#{@model.created_at}</span>
            </div>
          </div>
        </div>
      </a>
    </li>
    """

NotificationsView = Backbone.View.extend
  initialize: (options) ->
    q.logger.debug 'NotificationsView#initialize'
    $(@el).html('')
    for info in @collection
      view = new InfoView model: info
      $(@el).append view.render()
    chrome.extension.sendRequest(action: 'read', menu: 'notifications')

FollowingView = Backbone.View.extend
  render: ->
    cls = unless @model.seen then 'unread' else ''
    q.logger.debug "following", @model
    if @model.action_type is 'following_tag_post'
      msg = chrome.i18n.getMessage(
        "following__msg__#{@model.action_type}"
        [@model.actor.name, "#{q.DOMAIN}/#{@model.actor.iconUrl}"]
      )
      content = @model.target_content
      """
      <li class='chunk #{cls}'>
        <a href='#{content.url}' target='_blank'>
          <div class='box'>
            <div class='left'>
              <div class='user-icon'>
              </div>
            </div>
            <div class='right'>
              <div class='content'>
                <div class='msg'>#{msg}</div>
                <div class='title'>#{content.title}</div>
              </div>
              <div class='status'>
                <span class='#{content.action}'>#{content.created_at_in_words}</span>
              </div>
            </div>
          </div>
        </a>
      </li>
      """
    else
      action_type = @model.action_type
      if action_type is 'own_post'
        action_type = 'post'
      actor = @model.actor
      content = @model.target_content
      if action_type in ['increment', 'stock', 'post', 'comment']
        msg = chrome.i18n.getMessage(
          "following__msg__#{action_type}"
          actor.display_name
        )
        """
        <li class='chunk #{cls}'>
          <a href='#{content.url}' target='_blank'>
            <div class='box'>
              <div class='left'>
                <div class='user-icon'>
                  <img class='icon-m' src='#{actor.profile_image_url}' alt='#{actor.display_name}'>
                </div>
              </div>
              <div class='right'>
                <div class='content'>
                  <div class='msg'>#{msg}</div>
                  <div class='title'>#{content.title}</div>
                </div>
                <div class='status'>
                  <span class='#{content.action}'>#{content.created_at_in_words}</span>
                </div>
              </div>
            </div>
          </a>
        </li>
        """
      else if action_type in ['follow_user']
        msg = chrome.i18n.getMessage(
          "following__msg__#{action_type}"
          [actor.url_name, content.url_name]
        )
        """
        <li class='chunk #{cls}'>
          <a href='#'>
            <div class='box'>
              <div class='right'>
                <div class='content'>
                  <div class='msg'>#{msg}</div>
                </div>
              </div>
            </div>
          </a>
        </li>
        """
      else
        ''


AllPostView = Backbone.View.extend
  render: ->
    tags = ''
    for tag in @model.tags
      tags += "<img class='icon-s' src='#{qiita.DOMAIN}#{tag.iconUrl}'/>#{tag.name}"
    cls = unless @model.seen then 'unread' else ''
    """
    <li class='chunk #{cls}'>
      <a href='#{@model.url}' target='_blank'>
        <div class='box'>
          <div class='left'>
            <div class='user-icon'>
              <img class='icon-m' src='#{@model.user.profile_image_url}' alt='#{@model.user.display_name}'>
            </div>
          </div>
          <div class='right'>
            <div class='content'>
              <div class='tags'>#{tags}</div>
              <div class='title'>#{@model.title}</div>
            </div>
            <div class='status'>
              <span class='#{@model.action}'>#{@model.created_at_in_words}</span>
            </div>
          </div>
        </div>
      </a>
    </li>
    """

ItemsView = Backbone.View.extend
  initialize: (options) ->
    q.logger.debug "ItemsView#initialize with #{options.menu}"
    $(@el).html('')
    for item in @collection
      view = new options.view_class model: item
      $(@el).append view.render()
    chrome.extension.sendRequest(action: 'read', menu: options.menu)

$ ->
  for menu in ['notifications', 'following', 'all_posts']
    do (menu) ->
      $(".menu > .#{menu}")
        # i18n of menu
        .html(chrome.i18n.getMessage(menu))
        # add click event handler
        .click ->
          $('.menu > .active').removeClass('active')
          $(this).addClass 'active'
          $('#contents > .active').removeClass('active')
          $("#contents > .#{menu}").addClass('active')
          chrome.extension.sendRequest(
            {action: 'click', menu: menu}
            (collection) ->
              if menu is 'notifications'
                new NotificationsView
                  collection: collection
                  el: $('#contents > .notifications > ol')
              else
                new ItemsView
                  view_class: if menu is 'following' then FollowingView else AllPostView
                  collection: collection
                  el: $("#contents > .#{menu} > ol")
                  menu: menu
          )
      chrome.extension.sendRequest(
        {action: 'getUnreadCount', menu: menu}
        (count) ->
          if count > 0
            $menu = $(".menu > .#{menu}")
            $menu.html("#{$menu.text()} (#{count})")
      )

  $('.menu > .notifications').trigger('click')
