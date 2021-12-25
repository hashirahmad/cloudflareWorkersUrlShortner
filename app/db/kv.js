import APIError from '../helpers/APIError'

export async function get({ key, json = true }) {
    // eslint-disable-next-line no-undef
    const value = await SHORTEN.get(key)
    return json ? JSON.parse(value) : value
}

export async function set({
    key,
    value,
    expireInSeconds = 86400,
    json = true,
}) {
    // eslint-disable-next-line no-param-reassign
    value = json ? JSON.stringify(value) : value
    // eslint-disable-next-line no-undef
    const result = await SHORTEN.put(key, value, {
        expirationTtl: expireInSeconds,
    })
    return result
}

export async function remove({ key }) {
    // eslint-disable-next-line no-undef
    const result = await SHORTEN.delete(key)
    return result
}

/**
 * It simply checks if the chosen slug by the
 * user is available to be taken or not.
 */
export async function isSlugTaken({ slug = '', assert = false }) {
    const value = await get({ key: slug, json: false })
    if (value && assert) {
        throw new APIError({
            errorCode: 'INVALID_PARAM',
            objectDetails: { slug },
            templateUserMessage: 'Your chosen slug is taken. Choose another!',
        })
    }
    return { taken: !!value, slug }
}
