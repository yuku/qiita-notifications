var fs  = require("fs");
var _   = require("underscore");
var jst = require("../source/js/jst");

var data = "var JST={};\n";

for (var name in jst) {
  data += "JST['" + name + "'] = " + _.template(jst[name]).source + ";\n";
}

fs.writeFileSync("contents/js/jst.js", data);
