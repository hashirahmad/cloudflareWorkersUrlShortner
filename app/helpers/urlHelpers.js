exports.isURL = (url) => {
    try {
        // eslint-disable-next-line no-param-reassign
        const actualURL = new URL(url)
        return { url: actualURL, is: true }
    } catch (err) {
        return { is: false }
    }
}
