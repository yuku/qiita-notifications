#Qiita Notifications extension
Keep up with Qiita, anywhere on the web.

#Requirements

- node
- coffeescript
- npm

#Build

```shell
$ cd path/to/qiita-notifications
$ npm install
$ cake build
```

#Installation

1. build
2. goto chrome://settings/extensions
3. check [Developer mode]
4. click [Load unpacked extension]
5. select qiita-notifications directory

#History

##0.3.2

- Support languages: en, ja

##0.3.1

- Highlight unread chunks.

##0.3.0

- Add 'Following' and 'All Posts' tabs.
- Close popup window when a link is clicked.

##0.2.4

- Show '-' to logged out user on the icon.
- Show 'Login required' on the popup.
- Once popup is opened change seen of all notifications to true.

##0.2.3

- Change icon.

##0.2.2

- Added a link to qiita.com to top of the popup.

##0.2.1

- Modify crawling interval to 150 sec.

##0.2.0

- Can show the number of unread notifications.
- Cache contents and count.

##0.1.0

- Can show notifications on the popup.
