var JST={};
JST['popup/item'] = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<li class=\''+
((__t=( className ))==null?'':__t)+
'\'><a ';
 if (href != '#') { 
__p+='href=\''+
((__t=( href ))==null?'':__t)+
'?utm_source=chrome-extention&utm_medium=browser-extention&utm_content='+
((__t=( type ))==null?'':__t)+
'\' target=\'_blank\' ';
 } 
__p+='><div class=\'left\'><div class=\'icon\'><img src=\''+
((__t=( src ))==null?'':__t)+
'\'></div></div><div class=\'right\'><div class=\'title\'>'+
((__t=( title ))==null?'':__t)+
'</div><div class=\'body\'>'+
((__t=( body ))==null?'':__t)+
'</div></div></a></li>';
}
return __p;
};
