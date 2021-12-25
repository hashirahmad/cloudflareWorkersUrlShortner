import { notify } from '../helpers/log'
import { fail } from '../helpers/restifyHelpers'

/**
 * This will catch any `err`(s) thrown
 * by the APIs and return to the user the
 * appropriate error or forwarding the error
 * which was originally throw as `APIError`.
 */
export default ({ event, err }) => {
    if (err.isBusinessError) {
        return fail(
            event.request,
            err.errorCode,
            err.objectDetails,
            err.templateUserMessage,
            null,
            err,
            400
        )
    }
    notify(true, { err }, 'Look into it')
    return fail(
        event.request,
        'UH_OH!',
        {},
        'Uh-oh! We need to look into what just happened.',
        null,
        err,
        500
    )
}
