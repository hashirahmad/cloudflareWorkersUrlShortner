# README

Basically, this is a boilerplate of:

- Basic `CRUD` operations (_I have only covered `create` and `read` and_)
- API Docs generation via `apidoc`
- `Express.js` like `app`
- Body parsing
- Central error handling/reporting
- Serving static content using `getAssetFromKV`
- Basic sanitization of `parameters` for APIs
- ESLint and Prettier integrated
- Cloudflare Workers KV (_a `NOSQL` database_)

for **Cloudflare Workers** with **familiarity of `node.js`**.

## Demo

Something like this: [`url`](https://url.hashir.pro)

## Changelog

<details>
<summary>See Changelog</summary>

## 25th Dec 2021

### `app/allAPIs.js`

- A single file to register `API`s

### `app/config.js`

- `allowedOrigins` which origins should be allowed

### `app/index.js`

- Cleaned up.
- Its now much simple to follow.
- From 168 lines to 10 lines

### `app/api/isSlugTaken.js`

- New API `/:slug/taken`
- It will check if the `slug` chosen by user is already taken or not.

### `app/api/links.js`

- Uses modularized `middleware` functions instead of from one `index.js` file

### `app/api/slug.js`

- Uses modularized `middleware` functions instead of from one `index.js` file

### `app/db/kv.js`

- `isSlugTaken` return json with following keys:
  - `taken`
  - `slug`

### `app/helpers/ids.js`

`ids` used for generating unique shorted url slug put under its own helper file

### `restifyHelpers.fail`, `restifyHelpers.ok`

- Returns all enabled `CORS` headers
- some **`snake_case`** variable names changed to **`lowerCamelCase`** names

### `app/middleware/cors.js`

- `isOriginAllowed` ~ Will check if the `request`'s origin is one of the allowed ones or not.
- `handleWhenOriginNotAllowed` ~ Simply throws `APIError` informing user that they are trying to request from non allowed origin.

### `app/middleware/gracefulErrorHandling.js`

- This will catch any `err`(s) thrown by the APIs and return to the user the appropriate error or forwarding the error which was originally throw as `APIError`.

### `app/middleware/measureDateDuration.js`

- Simply attaches current `Date` object to the request so that when sending a response, we can calculate the duration.

### `app/middleware/notFound.js`

- It simply informs the user that the API they are looking for does not exist.

### `app/middleware/parseJsonBody.js`

- It basically parses the `body` of the `request` appropriate to its content type.

### `app/middleware/redirectToDocs.js`

- It simply just redirect the user to the `.docs` when visiting home page of the API i.e. `/` root path.

### `app/middleware/routing.js`

- It takes care of `CORS` as well as:
  - redirecting to `/docs` when visiting root path
  - serving docs from `KV` when visiting `/docs`
  - also handling API requests
  - central error catching when APIs throw errors

### `app/middleware/serveDocs.js`

- It serves our `docs` i.e. all the generated HTML files from `KV` database and responds when cannot find or going haywire in the process.

</details>

## Cloudflare Workers

Get to know what [Cloudflare Workers](https://workers.cloudflare.com/) **really** is.

In short, cloud functions without cold starts

## How to do local development?

You do need to put relevant **details** in `wrangler.toml` file.
If it is of any help, have a look at the `wranglerYOUR_FILE.toml`

From **root** directory:

```bash
wrangler dev
```

and it will pick up your changes on save like `nodemon` for `node.js`

## API Docs building

This boilerplate uses [`apidoc`](https://www.npmjs.com/package/apidoc) to generate necessary docs for your micro service API. So get to know the basics.

In short, `/src/templates/apidocs_template` should not be **touched**. Same advice goes for `/src/static_files`.

### How to generate?

```bash
cd /app && npm run build_docs
```

would generate the `docs`

## MongoDB

Cloudflare Workers, as of right now (16 Oct 2021), **does not** support
MongoDB connection. There is also, even if it was supported, it would take
more than `10ms` of CPU time which is the limit for Cloudflare Workers.

## Please note

- `/src/index.js` ~ this is your main `app` and do whatever tweaks and changes needed.
