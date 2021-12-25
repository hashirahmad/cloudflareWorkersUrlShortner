import { router } from '../middleware/routing'
import measureDateDuration from '../middleware/measureDateDuration'
import parseJsonBody from '../middleware/parseJsonBody'
import { idLowerABC, idNumeric } from '../helpers/ids'
import { isSlugTaken, set } from '../db/kv'
import {
    getAsStringAlphanumeric,
    getAsURL,
    ok,
} from '../helpers/restifyHelpers'

/**
 * @api {post} /link URL link
 * @apiName /link
 * @apiGroup Basic
 * @apiPermission none
 *
 * @apiDescription It will take a long or short URL and return an easy to remember **slug** which will redirect to original link. Valid for 24hrs only.
 * @apiParam {string}		url	    the url to be shortened.
 * @apiParam {string}		slug	some word to remember or type easily. It will automatically choose random `slug` if none chosen.

 * @apiSuccess {string}   status        ok

@apiSuccessExample {json} Success
{
    "message": "Link shortened successfully",
    "slug": "qsbo47"
    "shortened" "http://127.0.0.1:3000/u/qsbo47"
}
@apiErrorExample {json} INVALID_PARAM
{
    errorCode: 'INVALID_PARAM',
    objectDetails: { slug },
    templateUserMessage: 'Your chosen slug is taken. Choose another!',
}
*/
router.post('/link', measureDateDuration, parseJsonBody, async (request) => {
    const numbers = idNumeric()
    const abc = idLowerABC()
    const randomSlug = abc + numbers
    const url = getAsURL(request, 'url', '', true)
    const userSlug = getAsStringAlphanumeric(request, 'slug', null, false, 9)
    const slug = userSlug || randomSlug
    await isSlugTaken({ slug, assert: true })
    await set({
        key: slug,
        value: url,
        json: false,
        expireInSeconds: 86400,
    })
    const shortenedURL = `${new URL(request.url).origin}/${slug}`
    const responseBody = {
        message: 'Link shortened successfully',
        slug,
        shortened: shortenedURL,
    }
    // eslint-disable-next-line no-undef
    return ok(request, responseBody)
})
