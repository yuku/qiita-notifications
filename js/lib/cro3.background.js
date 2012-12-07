// Chromium trioxide

// (c) 2012 Yuku Takahashi
// CrO3 may be freely distributed under the MIT license.

(function () {
  
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

  // CrO3.Background
  // ---------------

  // Create a new manager which works on background
  var Background = CrO3.Background = function (settings) {
    var key, value;

    // Singleton
    if (Background.instance) {
      return Background.instance;
    }

    var background = { defaults: {}, validates: {} };

    // registers defaults and validation functions
    settings || (settings = {});
    for (key in settings) {
      value = settings[key];
      if (typeof value === 'object' && value['default']) {
        background.defaults[key] = value['default'];
        if (typeof value.validate === 'function') {
          background.validates[key] = value.validate;
        }
      } else {
        background.defaults[key] = value;
      }
    }

    // Set singleton instance
    Object.defineProperty(Background, 'instance', {
      value: background,
      writable: false,
      configurable: false
    });

    Object.defineProperties(background, {
      validate: {
        value: function (attr, value) {
          var validate = this.validates[attr];
          if (validate) {
            return validate.call(this, value);
          }
        },
        writable: false,
        configurable: false
      },

      // Get the value of setting
      get: {
        value: function (attr) {
          var value = localStorage[attr];
          return {
            status: 'success',
            msg: value === undefined ? this.defaults[attr] : JSON.parse(value)
          };
        },
        writable: false,
        configurable: false
      },

      // Set a hash of setting values on localStorage
      set: {
        value: function (key, value, options) {
          var attrs, attr, error, errors = {}, failed = false;
          if (typeof key === 'object' || key == null) {
            attrs = key;
            options = value;
          } else {
            attrs = {};
            attrs[key] = value;
          }

          options || (options = {});

          for (attr in attrs) {
            error = this.validate(attr, attrs[attr]);
            if (error) {
              errors[attr] = error;
              failed = true;
            }
          }
          if (failed) {
            return {
              status: 'fail',
              msg: errors
            };
          }

          for (attr in attrs) {
            if (options.unset) {
              localStorage.removeItem(attr);
            } else {
              localStorage.setItem(attr, JSON.stringify(attrs[attr]));
            }
          }

          return { status: 'success', msg: attrs };
        },
        writable: false,
        configurable: false
      },

      // Remove a setting from localStorage.
      unset: {
        value: function (attr, options) {
          (options || (options = {})).unset = true;
          return this.set(attr, null, options);
        },
        writable: false,
        configurable: false
      },

      // Return an array of setting keys
      keys: {
        value: function () {
          return { status: 'success', msg: Object.keys(localStorage) };
        },
        writable: false,
        configurable: false
      }
    });

    // onRequest handler
    chrome.extension.onRequest.addListener(function (req, sender, res) {
      switch (req.action) {
      case 'cro3.settings.get':
        res(background.get.apply(background, req.args));
        break;
      case 'cro3.settings.set':
        res(background.set.apply(background, req.args));
        break;
      case 'cro3.settings.unset':
        res(background.unset.apply(background, req.args));
        break;
      case 'cro3.settings.keys':
        res(background.keys.apply(background, req.args));
        break;
      }
    });

    return background;
  };

})();
