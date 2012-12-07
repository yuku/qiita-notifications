.PHONY: build

build:
	@lessc -x less/popup.less > css/popup.css
	@lessc -x less/options.less > css/options.css
