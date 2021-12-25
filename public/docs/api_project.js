define({
  "name": "URL Shortener",
  "version": "1.0.0",
  "description": "A URL shortener app",
  "title": "URL Shortener",
  "url": "",
  "sampleUrl": "DYNAMIC",
  "header": {
    "title": "Overview",
    "content": "<h1>Overview</h1>\n<p>The purpose of this 'micro-service' API is to a demonstrate familiar <code>node.js</code> operations on Cloudflare Workers (<em>they run on JavaScript V8 Engine</em>) like:</p>\n<ul>\n<li>Basic <code>CRUD</code> operations (<em>I have only covered <code>create</code> and <code>read</code> operations</em>)</li>\n<li>API Docs generation via <code>apidoc</code></li>\n<li><code>Express.js</code> like <code>app</code></li>\n<li>Body parsing</li>\n<li>Central error handling/reporting</li>\n<li>Cloudflare Workers KV (<em>a <code>NOSQL</code> database</em>)</li>\n<li>Serving static content using <code>getAssetFromKV</code></li>\n<li>Basic sanitization of <code>parameters</code> for APIs</li>\n<li>ESLint and Prettier integrated</li>\n</ul>\n<p>In a nutshell, it is boiler plate for running APIs on Cloudflare Workers with <strong>familiarity of <code>node.js</code></strong>.</p>\n<h2>What this 'micro-service' offers?</h2>\n<p>In a nutshell, basically:</p>\n<ul>\n<li>create a short URL for long URL</li>\n<li>easily view a long URL from short URL.</li>\n<li>short url offers custom <code>slug</code> of your choice.</li>\n</ul>\n<p>That's it.</p>\n"
  },
  "footer": {
    "content": ""
  },
  "template": {
    "withCompare": true,
    "withGenerator": true
  },
  "defaultVersion": "0.0.0",
  "apidoc": "0.3.0",
  "generator": {
    "name": "apidoc",
    "time": "2021-12-19T12:01:02.091Z",
    "url": "http://apidocjs.com",
    "version": "0.17.7"
  }
});
