import restify from '../helpers/restifyHelpers'

/**
 * It simply informs the user that
 * the API they are looking for
 * does not exist.
 */
export default (request) => {
    return restify.fail(
        request,
        'NOTHING_HERE',
        {},
        'There is no such API for this route. Please go to `/docs` for more information.',
        null
    )
}
