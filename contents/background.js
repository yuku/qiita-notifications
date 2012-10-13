(function() {
  var DOMAIN, Item, Items, all_posts, badge, following, getCollection, notifications, q, settingManager;

  q = this.qiita;

  DOMAIN = q.DOMAIN;

  q.b = badge = new Backbone.Model;

  _.extend(badge, {
    defaults: {
      count: 0
    },
    url: "" + DOMAIN + "/api/notifications/count"
  });

  badge.bind('change:count', function() {
    var color, curr, prev, text;
    prev = this.previous('count');
    curr = this.get('count');
    if (prev !== curr) {
      if (curr === null) {
        text = '?';
        color = [100, 100, 100, 100];
      } else if (curr === 0) {
        text = '0';
        color = [100, 100, 100, 255];
      } else {
        text = curr.toString();
        color = [204, 60, 41, 255];
      }
      chrome.browserAction.setBadgeText({
        text: text
      });
      chrome.browserAction.setBadgeBackgroundColor({
        color: color
      });
      if (prev < curr) return this.trigger('increment', curr - prev);
    }
  });

  badge.bind('increment', function(count) {
    return notifications.fetch({
      success: function() {
        return notifications.notify(count);
      }
    });
  });

  q.n = notifications = new Backbone.Collection;

  _.extend(notifications, {
    url: "" + DOMAIN + "/api/notifications",
    notify: function(count) {
      var time;
      q.logger.debug('Notifications#notify');
      if (settingManager.get('notifyNotifications')) {
        time = settingManager.get('notifyTime');
        return this.models.slice(0, count).forEach(function(model, i) {
          var notification, user;
          notification = window.webkitNotifications.createNotification(model.get('users')[0].profile_image_url, '', chrome.i18n.getMessage(model.get('action'), ((function() {
            var _i, _len, _ref, _results;
            _ref = model.get('users');
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              user = _ref[_i];
              _results.push(user.display_name);
            }
            return _results;
          })()).join(', ')).replace(/<[^>]*>/g, ' ').replace('  ', ' '));
          notification.show();
          if (time > 0) {
            return setTimeout(function() {
              return notification.cancel();
            }, (i + 1) * time * 1000);
          }
        });
      }
    },
    readAll: function() {
      this.each(function(model) {
        return model.set('seen', true);
      });
      $.get("" + DOMAIN + "/api/notifications/read");
      return badge.set('count', 0);
    },
    getCount: function() {
      return badge.get('count');
    }
  });

  Item = Backbone.Model.extend({
    defaults: {
      seen: true
    }
  });

  Items = Backbone.Collection.extend({
    initialize: function() {
      var _this = this;
      return this.bind('reset', function() {
        var new_item_count;
        if (_this.max_id === Infinity && _this.read_max_id === Infinity) {
          _this.count = 0;
          return _this.read_max_id = _this.max_id = _this.max(function(model) {
            return model.id;
          }).id;
        } else {
          _this.count = _this.filter(function(model) {
            return model.id > _this.read_max_id;
          }).length;
          new_item_count = _this.filter(function(model) {
            return model.id > _this.max_id;
          }).length;
          _this.models.slice(0, _this.count).forEach(function(model) {
            return model.set('seen', false);
          });
          if (new_item_count > 0) _this.notify(new_item_count);
          return _this.max_id = _this.max(function(model) {
            return model.id;
          }).id;
        }
      });
    },
    model: Item,
    max_id: Infinity,
    read_max_id: Infinity,
    count: 0,
    notify: function(count) {
      var time,
        _this = this;
      q.logger.debug("" + this.cls + "#notify");
      if (settingManager.get("notify" + this.cls)) {
        time = settingManager.get('notifyTime');
        return this.models.slice(0, count).forEach(function(model, i) {
          var notification;
          notification = _this.createNotification(model);
          notification.show();
          if (time > 0) {
            return setTimeout(function() {
              return notification.cancel();
            }, (i + 1) * time * 1000);
          }
        });
      }
    },
    readAll: function() {
      this.each(function(model) {
        return model.set('seen', true);
      });
      this.read_max_id = this.max_id;
      return this.count = 0;
    },
    getCount: function() {
      return this.count;
    }
  });

  q.f = following = new Items;

  _.extend(following, {
    url: "" + DOMAIN + "/following",
    cls: 'Following',
    createNotification: function(model) {
      var action_type, actor, content, title, url;
      action_type = model.get('action_type');
      actor = model.get('actor');
      if (action_type === 'following_tag_post') {
        url = "" + DOMAIN + "/" + actor.iconUrl;
        title = chrome.i18n.getMessage("desktop_notification__" + action_type, actor.name);
        content = model.get('target_content').title;
      } else {
        if (action_type === 'own_post') action_type = 'post';
        url = actor.profile_image_url;
        title = chrome.i18n.getMessage("desktop_notification__" + action_type, actor.display_name);
        content = model.get('target_content').title;
      }
      return window.webkitNotifications.createNotification(url, title, content);
    }
  });

  q.a = all_posts = new Items;

  _.extend(all_posts, {
    url: "" + DOMAIN + "/api/v1/items",
    cls: 'AllPosts',
    createNotification: function(model) {
      return window.webkitNotifications.createNotification(model.get('user').profile_image_url, model.get('title'), model.get('tags').map(function(tag) {
        return "#" + tag.name;
      }).join(' '));
    }
  });

  settingManager = {
    defaults: {
      'notifyNotifications': true,
      'notifyFollowing': true,
      'notifyAllPosts': false,
      'notifyTime': 2,
      'token': null,
      'url_name': null
    },
    getAll: function() {
      var name, res;
      res = {};
      for (name in this.defaults) {
        res[name] = this.get(name);
      }
      return res;
    },
    get: function(name) {
      q.logger.debug("get:" + name);
      if (localStorage[name] != null) {
        return JSON.parse(localStorage.getItem(name));
      } else {
        return this.defaults[name];
      }
    },
    set: function(name, value) {
      q.logger.debug("set:" + name, JSON.stringify(value));
      return localStorage.setItem(name, JSON.stringify(value));
    }
  };

  getCollection = function(menu) {
    if (menu === 'notifications') {
      return notifications;
    } else if (menu === 'following') {
      return following;
    } else if (menu === 'all_posts') {
      return all_posts;
    }
  };

  chrome.extension.onRequest.addListener(function(req, sender, res) {
    var collection, get, getAll;
    collection = getCollection(req.menu);
    if (req.action === 'click') {
      return res(collection);
    } else if (req.action === 'read') {
      return collection.readAll();
    } else if (req.action === 'getUnreadCount') {
      return res(collection.getCount());
    } else if (req.action === 'settings') {
      switch (req.type) {
        case 'set':
          return settingManager.set(req.name, req.value);
        case 'get':
          if (req.name === 'all') {
            getAll = settingManager.getAll();
            q.logger.debug('getAll', getAll);
            return res(getAll);
          } else {
            get = settingManager.get(req.name);
            q.logger.debug("get:" + req.name, get);
            return res(get);
          }
      }
    }
  });

  $(function() {
    var update;
    update = function() {
      q.logger.debug('update');
      badge.fetch({
        error: function() {
          return badge.set('count', null);
        }
      });
      following.fetch({
        error: function() {
          return following.reset();
        }
      });
      return all_posts.fetch({
        error: function() {
          return all_posts.reset();
        }
      });
    };
    setInterval(update, 60 * 1000);
    update();
    return notifications.fetch();
  });

}).call(this);
