(function() {
  var InfoView, ItemView, ItemsView, NotificationsView, q;

  q = this.qiita;

  q.LOG_LEVEL = q.logLevels.DEBUG;

  InfoView = Backbone.View.extend({
    render: function() {
      var alt, cls, content, src, user;
      content = chrome.i18n.getMessage(this.model.action, ((function() {
        var _i, _len, _ref, _results;
        _ref = this.model.users;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          user = _ref[_i];
          _results.push(user.display_name);
        }
        return _results;
      }).call(this)).join(', '));
      alt = this.model.users[0].display_name;
      src = this.model.users[0].profile_image_url;
      cls = !this.model.seen ? 'unread' : '';
      return "<li class='notification " + cls + "'>\n  <a href='" + this.model.object + "' target='_blank'>\n    <div class='box'>\n      <div class='left'>\n        <div class='user-icon'>\n          <img class='icon-m' src='" + src + "' alt='" + alt + "'>\n        </div>\n      </div>\n      <div class='right'>\n        <div class='content'>" + content + "</div>\n        <div class='status'>\n          <span class='" + this.model.action + "'>" + this.model.created_at + "</span>\n        </div>\n      </div>\n    </div>\n  </a>\n</li>";
    }
  });

  NotificationsView = Backbone.View.extend({
    initialize: function(options) {
      var info, view, _i, _len, _ref;
      q.logger.debug('NotificationsView#initialize');
      $(this.el).html('');
      _ref = this.collection;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        info = _ref[_i];
        view = new InfoView({
          model: info
        });
        $(this.el).append(view.render());
      }
      return chrome.extension.sendRequest({
        action: 'read',
        menu: 'notifications'
      });
    }
  });

  ItemView = Backbone.View.extend({
    render: function() {
      var cls, tag, tags, _i, _len, _ref;
      tags = '';
      _ref = this.model.tags;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tag = _ref[_i];
        tags += "<img class='icon-s' src='https://qiita.com" + tag.iconUrl + "'/>" + tag.name;
      }
      cls = !this.model.seen ? 'unread' : '';
      return "<li class='chunk " + cls + "'>\n  <a href='" + this.model.url + "' target='_blank'>\n    <div class='box'>\n      <div class='left'>\n        <div class='user-icon'>\n          <img class='icon-m' src='" + this.model.user.profile_image_url + "' alt='" + this.model.user.display_name + "'>\n        </div>\n      </div>\n      <div class='right'>\n        <div class='content'>\n          <div class='tags'>" + tags + "</div>\n          <div class='title'>" + this.model.title + "</div>\n        </div>\n        <div class='status'>\n          <span class='" + this.model.action + "'>" + this.model.created_at + "</span>\n        </div>\n      </div>\n    </div>\n  </a>\n</li>";
    }
  });

  ItemsView = Backbone.View.extend({
    initialize: function(options) {
      var item, view, _i, _len, _ref;
      q.logger.debug('ItemsView#initialize');
      $(this.el).html('');
      _ref = this.collection;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        view = new ItemView({
          model: item
        });
        $(this.el).append(view.render());
      }
      return chrome.extension.sendRequest({
        action: 'read',
        menu: options.menu
      });
    }
  });

  $(function() {
    var menu, _fn, _i, _len, _ref;
    _ref = ['notifications', 'following', 'all_posts'];
    _fn = function(menu) {
      $(".menu > ." + menu).html(chrome.i18n.getMessage(menu)).click(function() {
        $('.menu > .active').removeClass('active');
        $(this).addClass('active');
        $('#contents > .active').removeClass('active');
        $("#contents > ." + menu).addClass('active');
        return chrome.extension.sendRequest({
          action: 'click',
          menu: menu
        }, function(collection) {
          if (menu === 'notifications') {
            return new NotificationsView({
              collection: collection,
              el: $('#contents > .notifications > ol')
            });
          } else {
            return new ItemsView({
              collection: collection,
              el: $("#contents > ." + menu + " > ol"),
              menu: menu
            });
          }
        });
      });
      return chrome.extension.sendRequest({
        action: 'getUnreadCount',
        menu: menu
      }, function(count) {
        var $menu;
        if (count > 0) {
          $menu = $(".menu > ." + menu);
          return $menu.html("" + ($menu.text()) + " (" + count + ")");
        }
      });
    };
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      menu = _ref[_i];
      _fn(menu);
    }
    return $('.menu > .notifications').trigger('click');
  });

}).call(this);