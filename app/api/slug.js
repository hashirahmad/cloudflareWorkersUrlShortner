import { get } from '../db/kv'
import APIError from '../helpers/APIError'
import { notify } from '../helpers/log'
import { getAsStringAlphanumeric } from '../helpers/restifyHelpers'
import { router, measureDateDuration } from '../index'

/**
 * @api {get} /slug URL Slug
 * @apiName /slug
 * @apiGroup Basic
 * @apiPermission none
 *
 * @apiDescription The actual URL slug which will redirect to the original lengthy URL.

 * @apiSuccess {string}   status        ok

@apiSuccessExample {json} Success
{
}
@apiErrorExample {json} EXAMPLE_ERR
{
    error: 'EXAMPLE_ERR',
    details: { hello: "world" },
    userMessage: `Hello there! Erm . . . something went wrong!!!`,
}
*/
router.get('/:slug', measureDateDuration, async (request) => {
    const slug = getAsStringAlphanumeric(request, 'slug', '', true, 6)
    const link = await get({ key: slug, json: false })
    notify(false, { slug, link })

    if (link) {
        // eslint-disable-next-line no-undef
        return new Response(null, {
            headers: { Location: link },
            status: 301,
        })
    }

    throw new APIError({
        errorCode: 'INVALID_LINK',
        templateUserMessage: 'Invalid link key or the link key expired.',
        objectDetails: { slug },
    })
})
