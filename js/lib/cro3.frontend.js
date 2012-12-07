// Chromium trioxide - Frontend

// (c) 2012 Yuku Takahashi
// CrO3 may be freely distributed under the MIT license.

(function ($) {

  /*global chrome: false */

  'use strict';

  // Initial Setup
  // -------------

  // Save the previous value of the `CrO3` variable
  var previousCrO3 = window.CrO3;

  // The top-level namespace.
  var CrO3 = window.CrO3 = {};

  // Runs cro3.js in *noConflict* mode, returning the `CrO3` variable to its
  // previous owner. Returns a reference to this CrO3 object.
  CrO3.noConflict = function () {
    window.CrO3 = previousCrO3;
    return this;
  };

  // CrO3.Setting
  // ------------

  var Setting = CrO3.Setting = function () {
  };

  $.extend(Setting.prototype, {
    // Get the value of setting from background
    get: function (attr, options) {
      var context = this.prepare(options);

      chrome.extension.sendRequest({
        action: 'cro3.settings.get',
        args: [attr, context.options]
      }, function (res) {
        res.status === 'success' ?
          context.deferred.resolve(res.msg) :
          context.deferred.reject(res.msg);
      });

      return context.promise;
    },

    // Set the value of setting
    set: function (key, value, options) {
      var attrs;
      if (typeof key === 'object' || key == null) {
        attrs = key;
        options = value;
      } else {
        attrs = {};
        attrs[key] = value;
      }

      var context = this.prepare(options);

      chrome.extension.sendRequest({
        action: 'cro3.settings.set',
        args: [attrs, context.options]
      }, function (res) {
        res.status === 'success' ?
          context.deferred.resolve(res.msg) :
          context.deferred.reject(res.msg);
      });

      return context.promise;
    },

    unset: function (attr, options) {
      var context = this.prepare(options);

      chrome.extension.sendRequest({
        action: 'cro3.settings.unset',
        args: [context.options]
      }, function (res) {
        res.status === 'success' ?
          context.deferred.resolve(res.msg) :
          context.deferred.reject(res.msg);
      });

      return context.promise;
    },

    keys: function (options) {
      var context = this.prepare(options);

      chrome.extension.sendRequest({
        action: 'cro3.settings.keys',
        args: [context.options]
      }, function (res) {
        res.status === 'success' ?
          context.deferred.resolve(res.msg) :
          context.deferred.reject(res.msg);
      });

      return context.promise;
    }
  });
  Object.defineProperties(Setting.prototype, {
    prepare: {
      value: function (options) {
        var dfd = $.Deferred(),
            promise = dfd.promise();

        options = $.extend(true, {}, options);

        if ($.isFunction(options.success)) { promise.done(options.success); }
        if ($.isFunction(options.error))   { promise.fail(options.error); }
        delete options.success;
        delete options.error;

        return { deferred: dfd, promise: promise, options: options };
      },
      enumerable: false,
      configurable: false
    }
  });

  // shared setting object
  var setting = new CrO3.Setting();

  if ($ != null) {

    // jQuery.fn.setting
    // -----------------
    // When called on input tag, loads the setting value of name attribute from
    // background and sets it as value attribute.
    //
    // Options:
    //
    // auto_save - Whether calls .save() on every change event. Defaults true.
    //   success - Callback function
    //     error - Callback function
    //
    // Returns the jQuery object
    $.fn.setting = function (options) {

      var defaults = {
        auto_save: true
      };
      options = $.extend(true, {}, defaults, options);

      var success_callback = options.success,
          error_callback   = options.error;

      this.each(function () {

        var $this = $(this), self = this;

        if (!$this.attr('name')) return;

        // set initial value
        setting
          .get($this.attr('name'))
          .done(function (value) {
            $this.val(value);
          });

        if (options.auto_save) {
          // save per change event
          $this.change(function () {
            var promise = $this.save();
            if ($.isFunction(success_callback)) {
              promise.done(function (msg) {
                success_callback.call(self, msg);
              });
            }
            if ($.isFunction(error_callback)) {
              promise.fail(function (msg) {
                error_callback.call(self, msg);
              });
            }
          });
        }

      });

      return this;
    };

    // Save current value
    $.fn.save = function () {

      var $this = $(this),
          dfd   = $.Deferred();

      if (!$this.attr('name')) return dfd.promise();

      setting
        .set($this.attr('name'), $this.val())
        .done(function (msg) { dfd.resolve(msg); })
        .fail(function (msg) { dfd.reject(msg); });

      return dfd.promise();
    };
  }

})(jQuery);
