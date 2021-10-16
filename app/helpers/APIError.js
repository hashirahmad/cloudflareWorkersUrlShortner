module.exports = class APIError extends Error {
    constructor({
        errorCode,
        objectDetails,
        templateUserMessage,
        internalDetails,
    }) {
        super(templateUserMessage)
        this.isBusinessError = true
        this.errorCode = errorCode
        this.objectDetails = objectDetails
        // Compile in any parameters
        if (!objectDetails) {
            // eslint-disable-next-line no-param-reassign
            objectDetails = {}
        }
        if (templateUserMessage) {
            this.templateUserMessage = templateUserMessage
        }
        this.internal_details = internalDetails
    }
}
