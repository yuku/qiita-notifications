q = @qiita

$ ->

  $('form').submit( (e) ->
    url_name = $("#url_name").val()
    password = $("#password").val()

    $.when(
      $.ajax(
        url  : 'https://qiita.com/api/v1/auth'
        type : 'POST'
        data :
          url_name : url_name
          password : password
        dataType : 'json'
      )
    ).done( (data) ->
      token = data.token
      chrome.extension.sendRequest(
        action : 'settings'
        type   : 'set'
        name   : 'token'
        value  : token
      )
      chrome.extension.sendRequest(
        action : 'settings'
        type   : 'set'
        name   : 'url_name'
        value  : data.url_name
      )
      location.href = 'options.html'
    ).fail( ->
      $('span').text('Authentication failed').show().fadeOut(5000)
    )

    return false
  )
