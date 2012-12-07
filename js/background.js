/*global CrO3: false */


(function (CrO3) {

  'use strict';

  new CrO3.Background({
    notify_notifications : true,
    notify_following     : true,
    notify_all_posts     : false,
    notify_time          : 2,
    token                : null,
    url_name             : null,
    following_tags       : [],
    following_users      : []
  });

})(CrO3);



// Google Analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-30142578-1']);
_gaq.push(['_trackPageview']);
(function () {
  /*jshint strict: false */
  var ga = document.createElement('script');
  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);
})();
