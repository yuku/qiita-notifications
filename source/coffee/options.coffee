q = @qiita
q.LOG_LEVEL = q.logLevels.DEBUG

# underscore
_.templateSettings =
  interpolate: /\{\{(.+?)\}\}/g
  evaluate: /\{%(.+?)%\}/g
  escape: /\{%-(.+?)%\}/g

setSetting = (name, val, response) ->
  chrome.extension.sendRequest(
    action : 'settings'
    type   : 'set'
    name   : name
    value  : val 
  )


initInputText = (name, value) ->
  $("##{name}").val(value).keyup( ->
    setSetting name, $(@).val()
  )


initInputNumber = (name, value) ->
  $("##{name}").val(value).keyup( ->
    setSetting name, parseInt($(@).val())
  ).click( ->
    setSetting name, parseInt($(@).val())
  )

initCheckBox = (name, value) ->
  $("##{name}").attr('checked', value).change( ->
    setSetting name, $(@).is(':checked')
  )


initDropDown = (name, value) ->
  $("##{name}").val(value).change( ->
    setSetting name, $(@).val()
  )


$ ->
  chrome.extension.sendRequest({
    action : 'settings'
    type   : 'get'
    name   : 'all'
  }, (msg) ->
    token = null
    for name, value of msg
      if name == 'token'
        token = value
        break
    location.href = 'login.html' if token is null


    for name, value of msg
      switch typeof value
        when 'string'  then initInputText   name, value
        when 'number'  then initInputNumber name, value
        when 'boolean' then initCheckBox    name, value
  )
