module.exports = {

  "popup/item": [
    "<li class='<%= className %>'>",
      "<a <% if (href != '#') { %>href='<%= href %>' target='_blank' <% } %>>",
        "<div class='left'>",
          "<div class='icon'>",
            "<img src='<%= src %>'>",
          "</div>",
        "</div>",
        "<div class='right'>",
          "<div class='title'><%= title %></div>",
          "<div class='body'><%= body %></div>",
        "</div>",
      "</a>",
    "</li>"
  ].join("")

}
