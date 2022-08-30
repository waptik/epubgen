const content = `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="<%= lang %>" lang="<%= lang %>">
<head>
  <title><%= title %></title>
  <link rel="stylesheet" type="text/css" href="style.css" />
</head>
<body>
  <% if (prependChapterTitles) { %>
    <h1><%= title %></h1>
    <% if (author.length) { %>
      <p class="epub-author"><%= author.join(', ') %></p>
    <% } %>
    <% if (url) { %>
      <p class="epub-link"><a href="<%= url %>"><%= url %></a></p>
    <% } %>
  <% } %>
  <%- content %>
</body>
</html>
` as string;

export default content;
