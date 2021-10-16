import { Router } from 'itty-router'
import { customAlphabet } from 'nanoid'
import {
    getAssetFromKV,
    NotFoundError,
    MethodNotAllowedError,
} from '@cloudflare/kv-asset-handler'
import restify from './helpers/restifyHelpers'
import log, { notify } from './helpers/log'

export const router = Router()
export const idLowerABC = customAlphabet('abcdefghijklmnopqrstuvwxyz', 4)
export const idUpperABC = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 2)
export const idNumeric = customAlphabet('123456789', 2)

function paramsToObject(entries) {
    const result = {}
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of entries) {
        result[key] = value
    }
    return result
}

// eslint-disable-next-line consistent-return
export const parseJsonBody = async (request) => {
    const contentType = String(request.headers.get('content-type'))
    if (contentType.startsWith('application/x-www-form-urlencoded')) {
        const urlParams = new URLSearchParams(await request.text())
        const body = paramsToObject(urlParams.entries())
        request.parsedBody = body
    } else if (contentType.startsWith('application/json')) {
        const body = await request.json()
        request.parsedBody = body
        log.notify(false, { body }, 'It gets here!')
    } else {
        return restify.fail(
            request,
            'INVALID_PARAMS',
            null,
            'FormData is not yet supported. Please send params as `application/x-www-form-urlencoded` or `application/json`',
            null,
            null,
            400
        )
        /**
         * This should work but cloudflare workers are
         * not mature yet on the way it handles formdata
         */
        // const formData = await request.formData()
        // const body = Object.fromEntries( formData.entries() )
        // request.parsedBody = body
        // log.notify( false, { body }, 'It gets here!' )
    }
}
export const measureDateDuration = (request) => {
    /** So we can measure each API response duration */
    // eslint-disable-next-line no-underscore-dangle
    request._date = new Date()
}
const notFound = (request) => {
    return restify.fail(
        request,
        'NOTHING_HERE',
        {},
        'There is no such API for this route. Please go to `/docs` for more information.',
        null
    )
}

async function handleEvent(event) {
    const requestUrl = new URL(event.request.url)
    let { pathname } = requestUrl
    const { search, hash } = requestUrl
    notify(false, {
        p: requestUrl.pathname,
    })
    if (requestUrl.pathname === '/') {
        notify(false, { redirect: true }, 'For', requestUrl.pathname)
        pathname = `/docs${pathname}`
        const destinationURL = requestUrl.origin + pathname + search + hash
        // eslint-disable-next-line no-undef
        return Response.redirect(destinationURL, 301)
    }
    if (requestUrl.pathname.includes('/docs')) {
        console.log('\n\n\t Its trying to server from KV', '\n\n')
        try {
            return await getAssetFromKV(event)
        } catch (e) {
            if (e instanceof NotFoundError) {
                return restify.fail(
                    event.request,
                    'NOT_FOUND',
                    null,
                    'No file or content found.',
                    null,
                    null,
                    400
                )
            }
            if (e instanceof MethodNotAllowedError) {
                return restify.fail(
                    event.request,
                    'NOT_ALLOWED',
                    null,
                    'This file or content is not allowed to be viewed',
                    null,
                    null,
                    403
                )
            }
            log.notify(
                true,
                {
                    err: e,
                    requestUrl,
                    href: requestUrl.href,
                    json: requestUrl.toJSON(),
                },
                'Uh-oh! We need to look into what just happened.'
            )
            return restify.fail(
                event.request,
                'UH_OH!',
                {},
                'Uh-oh! We need to look into what just happened.',
                null,
                null,
                500
            )
        }
    }

    router.all('*', notFound)
    return router.handle(event.request).catch((err) => {
        if (err.isBusinessError) {
            return restify.fail(
                event.request,
                err.errorCode,
                err.objectDetails,
                err.templateUserMessage,
                null,
                err,
                400
            )
        }
        log.notify(true, { err }, 'Look into it')
        return restify.fail(
            event.request,
            'UH_OH!',
            {},
            'Uh-oh! We need to look into what just happened.',
            null,
            err,
            500
        )
    })
}

// eslint-disable-next-line no-restricted-globals, no-undef
addEventListener('fetch', (event) => {
    event.respondWith(handleEvent(event))
})

/** ALL APIs */
require('./api/links')
require('./api/slug')
