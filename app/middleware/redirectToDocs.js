import { notify } from '../helpers/log'

/**
 * It simply just redirect the user to
 * the `.docs` when visiting home page of the
 * API i.e. `/` root path.
 */
export default (event) => {
    const requestUrl = new URL(event.request.url)
    let { pathname } = requestUrl
    const { search, hash } = requestUrl
    notify(false, { redirect: true }, 'For', requestUrl.pathname)
    pathname = `/docs${pathname}`
    const destinationURL = requestUrl.origin + pathname + search + hash
    // eslint-disable-next-line no-undef
    return Response.redirect(destinationURL, 301)
}
