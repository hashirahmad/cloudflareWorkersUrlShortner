import {
    getAssetFromKV,
    NotFoundError,
    MethodNotAllowedError,
} from '@cloudflare/kv-asset-handler'
import { notify } from '../helpers/log'

const restify = require('../helpers/restifyHelpers')

/**
 * It serves our `docs` i.e. all the generated
 * HTML files from `KV` database and responds when
 * cannot find or going haywire in the process.
 */
export default async (event) => {
    const requestUrl = new URL(event.request.url)
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
        notify(
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
