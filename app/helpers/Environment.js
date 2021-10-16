// eslint-disable-next-line no-undef
const envValue = EXPLORING_LIVE
exports.isProduction = () => {
    const value = Number(envValue)
    return value === 2
}

exports.isStaging = () => {
    const value = Number(envValue)
    return value === 1
}

exports.isLocal = () => {
    const value = Number(envValue)
    return value === 0
}

exports.getEnvName = () => {
    if (exports.isLocal()) {
        return 'Local'
    }
    if (exports.isStaging()) {
        return 'Staging'
    }
    if (exports.isProduction()) {
        return 'Production'
    }
    return 'Unknown'
}
