fs      = require 'fs'
{spawn} = require 'child_process'
{exec} = require 'child_process'
{log}   = require 'util'
{debug} = require 'util'
stylus  = require 'stylus'
jade    = require 'jade'


srcDir = 'source'
targetDir = 'build'

srcCoffeeDir = "#{srcDir}/coffee"
srcStylusDir = "#{srcDir}/stylus"
srcJadeDir = "#{srcDir}/jade"

# It walks through a directory and invoke callback function with array of file names.
walk = (dir, callback) ->
  results = []
  fs.readdir dir, (err, list) ->
    return callback err if err
    pending = list.length
    return callback null, results unless pending
    list.forEach (file) ->
      file = "#{dir}/#{file}"
      fs.stat file, (err, stat) ->
        if stat and stat.isDirectory()
          walk file, (err, res) ->
            results = results.concat res
            callback null, results unless --pending
        else
          results.push file
          callback null, results unless --pending


option '-t', '--target [TARGET]', 'target source'

task 'build', 'Build source files', (options) ->
  targets = (options.target or 'coffee,jade,stylus')
    .split(',')
    .filter (target) -> target in ['coffee', 'jade', 'stylus']

  try
    stats = fs.statSync targetDir 
  catch e
    log "mkdir #{targetDir}"
    fs.mkdirSync targetDir 

  if 'coffee' in targets
    walk srcCoffeeDir, (err, results) ->
      for file in results
        filename = file.split('/')[2].split('.')[0]
        log "compile #{file} -> #{targetDir}/#{filename}.js"
    coffee = spawn 'coffee', ['-c', '-o', targetDir, srcCoffeeDir]
    coffee.stderr.on 'data', (data) -> debug data
    coffee.stdout.on 'data', (data) -> log data

  if 'jade' in targets
    walk srcJadeDir, (err, results) ->
      debug err if err

      for file in results
        filename = file.split('/')[2].split('.')[0]
        log "compile #{file} -> #{targetDir}/#{filename}.html"
        content = fs.readFileSync file
        html = jade.compile(content, {filename: file})()
        fs.writeFileSync "#{targetDir}/#{filename}.html"
                     , html
                     , 'utf8'

  if 'stylus' in targets
    walk srcStylusDir, (err, results) ->
      debug err if err

      for file in results
        filename = file.split('/')[2].split('.')[0]
        log "compile #{file} -> #{targetDir}/#{filename}.css"
        content = fs.readFileSync file, 'utf8'
        stylus(content)
          .render (err, css) -> 
            fs.writeFile "#{targetDir}/#{filename}.css"
                        , css
                        , 'utf8'
                        , (err) -> debug err if err

task 'zip', ->
  exec 'zip qiita-notifications.zip manifest.json lib/* images/* build/* _locales/*/*',
    (err, stdout, stderr) ->
      debug stderr if stderr
      log stdout if stdout
