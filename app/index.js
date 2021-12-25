import { handleEvent } from './middleware/routing'

// eslint-disable-next-line no-restricted-globals, no-undef
addEventListener('fetch', (event) => {
    event.respondWith(handleEvent(event))
})

/** Enable APIs */
require('./allAPIs')
