@qiita ?= {}
q = @qiita

q.logLevels =
  DEBUG   : 1
  WARNING : 2
  ERROR   : 3
  FATAL   : 4
  NONT    : 5

q.LOG_LEVEL = q.logLevels.DEBUG
q.DOMAIN = 'https://qiita.com'

q.logger =
  printLog: (n, a, o) ->
    if o
      console.log "#{n}: #{a} : %o", o
    else
      console.log "#{n}: #{a}"

  debug: (a, o) -> if q.LOG_LEVEL <= q.logLevels.DEBUG   then @printLog 'DEBUG', a, o
  warn : (a, o) -> if q.LOG_LEVEL <= q.logLevels.WARNING then @printLog 'WARNING', a, o
  error: (a, o) -> if q.LOG_LEVEL <= q.logLevels.ERROR   then @printLog 'ERROR', a, o
  fatal: (a, o) -> if q.LOG_LEVEL <= q.logLevels.FATAL   then @printLog 'FATAL', a, o
