export default "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<package xmlns=\"http://www.idpf.org/2007/opf\"\n         version=\"3.0\"\n         unique-identifier=\"BookId\"\n         xmlns:dc=\"http://purl.org/dc/elements/1.1/\"\n         xmlns:dcterms=\"http://purl.org/dc/terms/\"\n         xml:lang=\"en\"\n         xmlns:media=\"http://www.idpf.org/epub/vocab/overlays/#\"\n         prefix=\"ibooks: http://vocabulary.itunes.apple.com/rdf/ibooks/vocabulary-extensions-1.0/\">\n\n    <metadata xmlns:dc=\"http://purl.org/dc/elements/1.1/\"\n              xmlns:opf=\"http://www.idpf.org/2007/opf\">\n\n        <dc:identifier id=\"BookId\"><%= id %></dc:identifier>\n        <meta refines=\"#BookId\" property=\"identifier-type\" scheme=\"onix:codelist5\">22</meta>\n        <meta property=\"dcterms:identifier\" id=\"meta-identifier\">BookId</meta>\n        <dc:title><%= title %></dc:title>\n        <meta property=\"dcterms:title\" id=\"meta-title\"><%= title %></meta>\n        <dc:language><%= lang %></dc:language>\n        <meta property=\"dcterms:language\" id=\"meta-language\"><%= lang %></meta>\n        <meta property=\"dcterms:modified\"><%= (new Date()).toISOString().split(\".\")[0]+ \"Z\" %></meta>\n        <dc:creator id=\"creator\"><%= author.join(\",\") %></dc:creator>\n        <meta refines=\"#creator\" property=\"file-as\"><%= author.join(\",\") %></meta>\n        <meta property=\"dcterms:publisher\"><%= publisher %></meta>\n        <dc:publisher><%= publisher %></dc:publisher>\n        <meta property=\"dcterms:date\"><%= date %></meta>\n        <dc:date><%= date %></dc:date>\n        <meta property=\"dcterms:rights\">All rights reserved</meta>\n        <dc:rights>Copyright &#x00A9; <%= (new Date()).getFullYear() %> by <%= publisher %></dc:rights>\n        <% if(cover) { %>\n        <meta name=\"cover\" content=\"image_cover\"/>\n        <% } %>\n        <meta name=\"generator\" content=\"epub-gen\" />\n        <meta property=\"ibooks:specified-fonts\">true</meta>\n\n    </metadata>\n\n    <manifest>\n        <item id=\"ncx\" href=\"toc.ncx\" media-type=\"application/x-dtbncx+xml\" />\n        <item id=\"toc\" href=\"toc.xhtml\" media-type=\"application/xhtml+xml\" properties=\"nav\" />\n        <item id=\"css\" href=\"style.css\" media-type=\"text/css\" />\n\n        <% if(cover) { %>\n        <item id=\"image_cover\" href=\"cover.<%= cover.extension %>\" media-type=\"<%= cover.mediaType %>\" />\n        <% } %>\n        \n        <% images.forEach(function(image, index){ %>\n        <item id=\"image_<%= index %>\" href=\"images/<%= image.id %>.<%= image.extension %>\" media-type=\"<%= image.mediaType %>\" />\n        <% }) %>\n        \n        <% content.forEach(function(content, index){ %>\n        <item id=\"content_<%= index %>_<%= content.id %>\" href=\"<%= content.filename %>\" media-type=\"application/xhtml+xml\" />\n        <% }) %>\n\n        <% fonts.forEach(function(font, index){%>\n        <item id=\"font_<%= index%>\" href=\"fonts/<%= font.filename %>\" media-type=\"<%= font.mediaType %>\" />\n        <%})%>\n    </manifest>\n\n    <spine toc=\"ncx\">\n        <% content.forEach(function(content, index){ %>\n            <% if(content.beforeToc){ %>\n                <itemref idref=\"content_<%= index %>_<%= content.id %>\"/>\n            <% } %>\n        <% }) %>\n        <itemref idref=\"toc\" />\n        <% content.forEach(function(content, index){ %>\n            <% if(!content.beforeToc){ %>\n                <itemref idref=\"content_<%= index %>_<%= content.id %>\"/>\n            <% } %>\n        <% }) %>\n    </spine>\n    <guide>\n        <reference type=\"text\" title=\"Table of Content\" href=\"toc.xhtml\"/>\n    </guide>\n</package>" as string;