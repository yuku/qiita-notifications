/*global chrome: false */


var renderItem = function (href, src, title, body, className) {

  'use strict';

  className || (className = '');

  return '<li class="' + className + '">' +
      '<a href="' + href + '" target="_blank">' +
        '<div class="left">' +
          '<div class="icon">' +
            '<img src="' + src + '">' +
          '</div>' +
        '</div>' +
        '<div class="right">' +
          '<div class="title">' + title + '</div>' +
          '<div class="body">' + body + '</div>' +
        '</div>' +
      '</a>' +
    '</li>';
};


var renderNotifications = function (data) {

  'use strict';

  var container = $('.notifications-list');
  container.html('');

  data.forEach(function (datum) {
    console.log(datum);
    var users = datum.users.map(function (user) {
      return user.url_name;
    }).join(', ');
    var href, src, title, body, className;
    className = datum.seen ? '' : 'unread';
    src = datum.users[0].profile_image_url;
    switch (datum.action) {
    case 'stock':
      title = '<strong>' + users + '</strong>があなたの投稿をストックしました';
      body = datum.short_title;
      break;
    case 'follow_user':
      title = '<strong>' + users + '</strong>があなたをフォローしました';
      body = '';
      break;
    //case 'reply':
    default:
      return; // ignore other actions
    }
    container.append(renderItem(href, src, title, body, className));
  });
};


var renderFollowing = function (data) {

  'use strict';

  var container = $('.following-list');
  container.html('');

  data.forEach(function (datum) {
    var actors = datum.actors;
    var target = datum.target_content;
    var href, src, title, body;
    href = target.url;
    switch (datum.action_type) {
    case 'stock':
      src = actors[0].profile_image_url;
      title = '<strong>' + actors.map(function (actor) {
        return actor.url_name;
      }).join(', ') + '</strong>がストックしました';
      body = target.title;
      break;
    case 'comment':
      src = actors[0].profile_image_url;
      title = '<strong>' + actors[0].url_name + '</strong>がコメントしました';
      body = target.title;
      break;
    case 'follow_tag':
      src = '#';
      title = '<strong>' + actors[0].url_name + '</strong>が<strong>' +
              target.name + '</strong>タグをフォローしました';
      body = '';
      break;
    case 'follow_user':
      src = '#';
      title = '<strong>' + actors[0].url_name + '</strong>が<strong>' +
              target.url_name +  '</strong>をフォローしました';
      body = '';
      break;
    case 'following_user_post':
      src = actors[0].profile_image_url;
      title = '<strong>' + actors[0].url_name + '</strong>が投稿しました';
      body = target.title;
      break;
    case 'following_tag_post':
      src = actors[0].icon_url;
      title = '<strong>' + actors[0].name + '</strong>に新しい投稿がありました';
      body = target.title;
      break;
    default:
      // ignore other action types such as own_post
      return;
    }
    container.append(renderItem(href, src, title, body));
  });
};


var renderPublic = function (data) {

  'use strict';

  var container = $('.public-list');
  container.html('');

  data.forEach(function (datum) {
    console.log(datum);
    var user = datum.user;
    var src = user.profile_image_url;
    var title = '<strong>' + user.url_name + '</strong>が投稿しました';
    var body = datum.title;
    var href = datum.url;
    container.append(renderItem(href, src, title, body));
  });

};


$(function () {

  'use strict';

  $('.menu span').click(function () {
    var $this = $(this);
    var id = $this.data('id');

    $('.menu .active').removeClass('active');
    $('#contents .active').removeClass('active');
    $this.addClass('active');
    $('.' + id).addClass('active');

    chrome.extension.sendRequest({
      action: 'get.' + id
    }, function (data) {
      switch (id) {
      case 'notifications':
        renderNotifications(data);
        break;
      case 'following':
        renderFollowing(data);
        break;
      case 'public':
        renderPublic(data);
        break;
      }
    });
  });

  // Initialize
  $('.menu span[data-id=notifications]').click();
});
