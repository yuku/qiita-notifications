#Qiita Notifications extension
Keep up with Qiita, anywhere on the web.

#Build

```shell
$ npm install
$ edit source/{coffee,jade,stylus}/*.{coffee,jade,stylus}
$ cake build
$ cd ../
$ zip qiita-notifications.zip \
      qiita-notifications/manifest.json \
      qiita-notifications/lib/* \
      qiita-notifications/images/* \
      qiita-notifications/build/*
```

##Requirements

- node
- coffeescript
- npm
