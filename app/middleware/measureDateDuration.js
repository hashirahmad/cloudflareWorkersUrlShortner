/**
 * Simply attaches current `Date` object
 * to the request so that when sending a
 * response, we can calculate the duration.
 */
export default (request) => {
    /** So we can measure each API response duration */
    // eslint-disable-next-line no-underscore-dangle
    request._date = new Date()
}
