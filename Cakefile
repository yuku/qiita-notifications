fs            = require 'fs'
{spawn, exec} = require 'child_process'
{log, debug}  = require 'util'
stylus        = require 'stylus'
jade          = require 'jade'

srcDir        = 'source'
targetDir     = 'contents'

srcCoffeeDir  = "#{srcDir}/coffee"
srcStylusDir  = "#{srcDir}/stylus"
srcJadeDir    = "#{srcDir}/jade"


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
  targets = (options.target or 'js,html,css,manifest')
    .split(',')
    .filter (target) -> target in ['js', 'html', 'css', 'manifest']

  try
    stats = fs.statSync targetDir
  catch e
    log "mkdir #{targetDir}"
    fs.mkdirSync targetDir

  if 'js' in targets
    walk srcCoffeeDir, (err, results) ->
      for file in results
        filename = file.split('/')[2].split('.')[0]
        log "compile #{file} -> #{targetDir}/#{filename}.js"
    coffee = spawn 'coffee', ['-c', '-o', targetDir, srcCoffeeDir]
    coffee.stderr.on 'data', (data) -> debug data
    coffee.stdout.on 'data', (data) -> log data

  if 'html' in targets
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

  if 'css' in targets
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

  if 'manifest' in targets
    log 'package.json -> manifest.json'
    fs.readFile "#{__dirname}/package.json", (err, data) ->
      throw err if err
      package_ = JSON.parse data
      delete package_.dependencies
      fs.writeFile "#{targetDir}/manifest.json", JSON.stringify(package_), (err) ->
        throw err if err

task 'zip', ->
  exec 'cd contents; zip -r ../qiita-notifications.zip ./',
    (err, stdout, stderr) ->
      debug stderr if stderr
      log stdout if stdout
