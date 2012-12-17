.PHONY: build

build:
	@jshint contents/js/*.js
	@lessc -x source/less/popup.less > contents/css/popup.css
	@lessc -x source/less/options.less > contents/css/options.css
	@lessc -x source/less/content_scripts.less > contents/css/content_scripts.css
	@node scripts/compile_jst.js
	@cd contents; zip -r ../qiita-notifications.zip ./
