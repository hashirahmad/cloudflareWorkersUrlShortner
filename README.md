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

Something like this: [`url`](https://url.hashir.app)

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
