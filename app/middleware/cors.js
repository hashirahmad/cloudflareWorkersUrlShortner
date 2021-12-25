import { allowedOrigins } from '../config'
import { fail } from '../helpers/restifyHelpers'

/**
 * Will check if the `request`'s origin
 * is one of the allowed ones or not.
 */
export function isOriginAllowed(event) {
    const { headers } = event.request
    return {
        allowed: allowedOrigins.includes(headers.get('origin')),
    }
}

/**
 * Simply throws `APIError` informing user that
 * they are trying to request from non allowed
 * origin.
 */
export function handleWhenOriginNotAllowed(event) {
    return fail(
        event.request,
        'NOT_ALLOWED',
        null,
        'Use either /docs or Postman or https://hashir.pro/services/url-shortner',
        null,
        null,
        403
    )
}
