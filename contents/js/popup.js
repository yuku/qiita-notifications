/* global chrome: false, JST: false */

var renderItem = function (href, src, title, body, className) {

  'use strict';

  className || (className = '');

  return JST['popup/item']({
    href      : href,
    src       : src,
    title     : title,
    body      : body,
    className : className
  });
};


var renderNotifications = function (data) {

  'use strict';

  var container = $('.notifications-list');
  container.html('');

  data.forEach(function (datum) {
    var users = datum.users.map(function (user) {
      return user.url_name;
    }).join(', ');
    var href, src, title, body, className;
    className = datum.seen ? '' : 'unread';
    src = users !== '' ? datum.users[0].profile_image_url : '';
    href = datum.object;
    body = datum.short_title;
    switch (datum.action) {
    case 'stock':
      title = '<strong>' + users + '</strong>があなたの投稿を<strong>ストック</strong>しました';
      break;
    case 'follow_user':
      title = '<strong>' + users + '</strong>があなたを<strong>フォロー</strong>しました';
      body = '';
      break;
    case 'lgtm':
      title = '<strong>' + users + '</strong>があなたの投稿に<strong>LGTM</strong>しました';
      break;
    case 'item_mention':
      title = '<strong>' + users + '</strong>があなたを<strong>メンション</strong>しました';
      break;
    case 'comment_mention':
      title = '<strong>' + users + '</strong>があなたをコメントで<strong>メンション</strong>しました';
      break;
    case 'update_stocked_chunk':
      title = '<strong>' + users + '</strong>があなたのストックした投稿に<strong>コメント</strong>しました';
      break;
    case 'update_posted_chunk':
      title = '<strong>' + users + '</strong>があなたのコメントした投稿に<strong>コメント</strong>しました';
      break;
    case 'receive_patch':
      title = '<strong>' + users + '</strong>があなたの投稿に<strong>編集リクエスト</strong>を送りました';
      break;
    case 'accept_patch':
      title = '<strong>' + users + '</strong>があなたの<strong>編集リクエスト</strong>を採用しました';
      break;
    case 'reply':
      title = '<strong>' + users + '</strong>があなたの投稿に<strong>コメント</strong>しました';
      break;
    case 'tweet':
      src = '/img/twitter.png';
      title = 'あなたの投稿が<strong>ツイート</strong>されました';
      break;
    case 'like':
      src = '/img/facebook.png';
      title = 'あなたの投稿が<strong>いいね</strong>されました';
      break;
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
    href = target.url || '#';
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
      src = actors[0].profile_image_url;
      title = '<strong>' + actors[0].url_name + '</strong>が<strong>' +
              target.name + '</strong>タグをフォローしました';
      body = '';
      break;
    case 'follow_user':
      src = actors[0].profile_image_url;
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
