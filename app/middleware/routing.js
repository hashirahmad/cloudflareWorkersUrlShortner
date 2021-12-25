import { Router } from 'itty-router'
import { handleWhenOriginNotAllowed, isOriginAllowed } from './cors'
import gracefulErrorHandling from './gracefulErrorHandling'
import notFound from './notFound'
import redirectToDocs from './redirectToDocs'
import serveDocs from './serveDocs'

export const router = Router()

/**
 * It takes care of `CORS` as well as:
 * - redirecting to `/docs` when visiting root path
 * - serving docs from `KV` when visiting `/docs`
 * - also handling API requests
 * - central error catching when APIs throw errors
 */
export async function handleEvent(event) {
    const requestUrl = new URL(event.request.url)
    if (!isOriginAllowed(event).allowed) {
        return handleWhenOriginNotAllowed(event)
    }
    if (requestUrl.pathname === '/') {
        return redirectToDocs(event)
    }
    if (requestUrl.pathname.includes('/docs')) {
        return serveDocs(event)
    }

    router.all('*', notFound)
    return router.handle(event.request).catch((err) => {
        return gracefulErrorHandling({ event, err })
    })
}
