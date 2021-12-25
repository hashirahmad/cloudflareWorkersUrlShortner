import { isSlugTaken } from '../db/kv'
import { getAsStringAlphanumeric, ok } from '../helpers/restifyHelpers'
import { router } from '../middleware/routing'
import measureDateDuration from '../middleware/measureDateDuration'
/**
 * @api {get} /:slug/taken Is Slug Taken
 * @apiName /:slug/taken
 * @apiGroup Basic
 * @apiPermission none
 *
 * @apiDescription It will check if the `slug` chosen by user is already taken or not.

 * @apiSuccess {string}   status        ok

@apiSuccessExample {json} Success
{
    "taken": false,
    "slug": "qsbo47"
}
*/
router.get('/:slug/taken', measureDateDuration, async (request) => {
    const slug = getAsStringAlphanumeric(request, 'slug', null, true, 9)
    const response = await isSlugTaken({ slug })
    const responseBody = { ...response }
    // eslint-disable-next-line no-undef
    return ok(request, responseBody)
})
