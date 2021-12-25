define({ "api": [
  {
    "type": "get",
    "url": "/:slug/taken",
    "title": "Is Slug Taken",
    "name": "__slug_taken",
    "group": "Basic",
    "permission": [
      {
        "name": "none"
      }
    ],
    "description": "<p>It will check if the <code>slug</code> chosen by user is already taken or not.</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "status",
            "description": "<p>ok</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success",
          "content": "{\n    \"taken\": false,\n    \"slug\": \"qsbo47\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "api/isSlugTaken.js",
    "groupTitle": "Basic",
    "sampleRequest": [
      {
        "url": "DYNAMIC/:slug/taken"
      }
    ]
  },
  {
    "type": "post",
    "url": "/link",
    "title": "URL link",
    "name": "_link",
    "group": "Basic",
    "permission": [
      {
        "name": "none"
      }
    ],
    "description": "<p>It will take a long or short URL and return an easy to remember <strong>slug</strong> which will redirect to original link. Valid for 24hrs only.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "url",
            "description": "<p>the url to be shortened.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "slug",
            "description": "<p>some word to remember or type easily. It will automatically choose random <code>slug</code> if none chosen.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "status",
            "description": "<p>ok</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success",
          "content": "{\n    \"message\": \"Link shortened successfully\",\n    \"slug\": \"qsbo47\"\n    \"shortened\" \"http://127.0.0.1:3000/u/qsbo47\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "INVALID_PARAM",
          "content": "{\n    errorCode: 'INVALID_PARAM',\n    objectDetails: { slug },\n    templateUserMessage: 'Your chosen slug is taken. Choose another!',\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "api/links.js",
    "groupTitle": "Basic",
    "sampleRequest": [
      {
        "url": "DYNAMIC/link"
      }
    ]
  },
  {
    "type": "get",
    "url": "/slug",
    "title": "URL Slug",
    "name": "_slug",
    "group": "Basic",
    "permission": [
      {
        "name": "none"
      }
    ],
    "description": "<p>The actual URL slug which will redirect to the original lengthy URL.</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "status",
            "description": "<p>ok</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success",
          "content": "{\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "EXAMPLE_ERR",
          "content": "{\n    error: 'EXAMPLE_ERR',\n    details: { hello: \"world\" },\n    userMessage: `Hello there! Erm . . . something went wrong!!!`,\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "api/slug.js",
    "groupTitle": "Basic",
    "sampleRequest": [
      {
        "url": "DYNAMIC/slug"
      }
    ]
  }
] });
