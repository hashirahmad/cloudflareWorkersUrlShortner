import restify from '../helpers/restifyHelpers'

function paramsToObject(entries) {
    const result = {}
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of entries) {
        result[key] = value
    }
    return result
}

/**
 * It basically parses the `body` of the `request`
 * appropriate to its content type.
 */
// eslint-disable-next-line consistent-return
export default async (request) => {
    const contentType = String(request.headers.get('content-type'))
    if (contentType.startsWith('application/x-www-form-urlencoded')) {
        const urlParams = new URLSearchParams(await request.text())
        const body = paramsToObject(urlParams.entries())
        request.parsedBody = body
    } else if (contentType.startsWith('application/json')) {
        const body = await request.json()
        request.parsedBody = body
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
