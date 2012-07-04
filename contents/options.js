(function() {
  var initCheckBox, initDropDown, initInputNumber, initInputText, q, setSetting;

  q = this.qiita;

  q.LOG_LEVEL = q.logLevels.DEBUG;

  _.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g,
    evaluate: /\{%(.+?)%\}/g,
    escape: /\{%-(.+?)%\}/g
  };

  setSetting = function(name, val, response) {
    q.logger.debug("set:" + name, val);
    return chrome.extension.sendRequest({
      action: 'settings',
      type: 'set',
      name: name,
      value: val
    });
  };

  initInputText = function(name, value) {
    return $("#" + name).val(value).keyup(function() {
      return setSetting(name, $(this).val());
    });
  };

  initInputNumber = function(name, value) {
    return $("#" + name).val(value).keyup(function() {
      return setSetting(name, parseInt($(this).val()));
    }).click(function() {
      return setSetting(name, parseInt($(this).val()));
    });
  };

  initCheckBox = function(name, value) {
    return $("#" + name).attr('checked', value).change(function() {
      return setSetting(name, $(this).is(':checked'));
    });
  };

  initDropDown = function(name, value) {
    return $("#" + name).val(value).change(function() {
      return setSetting(name, $(this).val());
    });
  };

  $(function() {
    return chrome.extension.sendRequest({
      action: 'settings',
      type: 'get',
      name: 'all'
    }, function(msg) {
      var name, value, _results;
      _results = [];
      for (name in msg) {
        value = msg[name];
        switch (typeof value) {
          case 'string':
            _results.push(initInputText(name, value));
            break;
          case 'number':
            _results.push(initInputNumber(name, value));
            break;
          case 'boolean':
            _results.push(initCheckBox(name, value));
            break;
          default:
            _results.push(void 0);
        }
      }
      return _results;
    });
  });

}).call(this);
