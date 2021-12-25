/* eslint-disable no-underscore-dangle */
/* eslint-disable no-useless-escape */
/* eslint-disable no-restricted-globals */
/* eslint-disable consistent-return */
/* eslint-disable eqeqeq */
/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */

const environment = require('./Environment')
const stringHelpers = require('./stringHelpers')
const APIError = require('./APIError')

// Version 2.0 - 20160807 Formatting

/**
 * @description Will return the parameter passed in by the http request.
 * This will return POST parameters first and if nothing is found it will return the GET parameter
 * @return The value of the parameter or null if nothing is found.
 */
// helper to get either body or param
// body takes precedence.
exports.getBodyOrParam = function (req, key) {
    if (req != null) {
        if (req.parsedBody != null) {
            if (req.parsedBody[key] != null) {
                return req.parsedBody[key]
            }
            // apidocs fix for when type 'object' is used and valid JSON array is submitted it appends '[]' to the key name.
            // e.g. in games/set_properties whitelist_game_origins with ["https://core-games-arcane-orbs.coinmode.com", "https://localhost:8080", "https://localhost:8081"]
            // req.parsedBody["whitelist_game_origins[]"] gives
            //  > Array(3) ["https://core-games-arcane-orbs.coinmode.com", "https://localhost:8080", "https://localhost:8081"]
            if (req.parsedBody[`${key}[]`] != null) {
                return req.parsedBody[`${key}[]`]
            }
        }
        if (req.params != null) {
            if (req.params[key] != null) {
                return req.params[key]
            }
        }
        if (req.query != null) {
            if (req.query[key] != null) {
                return req.query[key]
            }
        }
    }
    // otherwise return
    return null
}

/**
 * @param errorCode - A fixed short string that the game developer can do a string comparison on to detect certain errors they are looking for. Should be less than 32 chars.
 * @param objectDetails - Must be an object.  This is returned to the caller in the 'detail' section.
 * @param templateUserMessage - The human readable error message to report.  It can use {{variables}} indexing the object_detail.
 * @param object_debug_only - Must be an object. This is returned only in staging environments, never in production.
 *
 * Will send to express a 200 status code and the following sort of response. e.g.
 *
 * status 200
 * {
 * 		error: "Balance error",
 * 		user_message: "There was an error with your balance, you only have 1000 units available",
 * 		details: objectDetails,
 * // In staging we also add
 * 		duration: 0.1,
 * 		object_debug_only: object_internal_staging_only
 * }
 */
exports.fail = function (
    req,
    errorCode,
    objectDetails,
    templateUserMessage,
    objectInternalStagingOnly,
    e,
    errorNumber = 503
) {
    const array_response = {
        status: 'error',
    }

    // Sanity check inputs
    if (typeof errorCode !== 'string') {
        // Not a string so not screening this
        // debug.notify_sentry("response failed with non string errorCode", templateUserMessage);
        errorCode = 'ERROR CODE HIDDEN'
    }

    if (templateUserMessage) {
        if (typeof templateUserMessage !== 'string') {
            // Not a string so not screening this
            // debug.notify_sentry("response failed with non string errorCode", templateUserMessage);
            // debug.log( JSON.stringify( templateUserMessage ) );
            templateUserMessage = 'USER MESSAGE OBJECT HIDDEN'
        }
    } else {
        templateUserMessage = errorCode
    }

    if (objectDetails) {
        if (typeof objectDetails !== 'object') {
            // debug.notify_sentry("response_failed called with objectDetails that is not an object", objectDetails);
        }
    }

    if (objectInternalStagingOnly) {
        if (
            typeof objectInternalStagingOnly !== 'object' &&
            typeof objectInternalStagingOnly !== 'string'
        ) {
            // debug.notify_sentry("response_failed called with object_internal_staging_only that is not an object", object_internal_staging_only);
        }
    }

    array_response.error = errorCode
    array_response.userMessage = templateUserMessage
    array_response.details = objectDetails

    if (!environment.isProduction()) {
        const duration = (new Date() - req._date) / 1000
        array_response.duration = duration
        // array_response.debug_templateUserMessage = templateUserMessage
        // array_response.object_debug_only = objectInternalStagingOnly
        array_response.stack = e ? e.stack : 'No stack to show'
    }

    // eslint-disable-next-line no-undef
    return new Response(JSON.stringify(array_response), {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
            'Access-Control-Allow-Headers': '*',
            'content-type': 'application/json',
        },
        status: errorNumber,
    })
    // Do not call next because we are saying we have completed the API request above
}

// Not happy with this bit, would rather it is in restify!
// eslint-disable-next-line consistent-return
exports.ok = function (req, jsonResponse) {
    let array_response = jsonResponse
    if (jsonResponse == null) {
        /**
		 * If no data given we return an empty object like this
		{
			"duration":0.001,
			"status": "ok"
		}
		 */
        array_response = {}
    }
    if (typeof jsonResponse !== 'object') {
        /* For data that is a string or number we return
		{
			"string" : {{your data}},
			"duration":0.001,
			"status": "ok"
		}
		*/
        array_response = {}
        array_response[typeof jsonResponse] = jsonResponse
    } else if (Array.isArray(jsonResponse)) {
        /* For arrays we return data as
		{
			"results": {{your data}}
			"duration":0.001,
			"status" : "ok"
		}
		*/
        array_response = { results: jsonResponse }
    }

    array_response.status = 'ok'
    const duration = (new Date().getTime() - req._date.getTime()) / 1000
    array_response.duration = duration

    if (req.deprecated === true) {
        array_response.deprecated =
            'This API call is being deprecated, please consult the documentation'
        array_response.how_to_upgrade = req.how_to_upgrade
    }

    // eslint-disable-next-line no-undef
    return new Response(JSON.stringify(array_response), {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
            'Access-Control-Allow-Headers': '*',
            'content-type': 'application/json',
        },
        status: 200,
    })
}

/**
 * Returns the IP address making the request call
 */
exports.getIP = function (req) {
    const ip =
        req.headers['cf-connecting-ip'] ||
        req.headers['x-original-forwarded-for'] ||
        req.headers['x-forwarded-for'] ||
        req.headers['X-FORWARDED-FOR'] ||
        req.headers['X-Forwarded-For'] ||
        req.headers['X-ProxyUser-Ip'] ||
        req.headers['X-REAL-IP'] ||
        req.connection.remoteAddress
    if (ip == '::1') {
        return '127.0.0.1'
    }
    return ip
}

exports.assertCharValidity = function (index, value, regex) {
    const invalidChars = value.match(regex)
    if (invalidChars) {
        throw new APIError({
            errorCode: 'INVALID_PARAMS',
            objectDetails: { index, invalidChars },
            templateUserMessage:
                'There were invalid characters found in the parameter {{index}}',
            internalDetails: { regex },
        })
    }
}

exports.assertIsNumber = function (value) {
    if (isNaN(value) || value === null || typeof value !== 'number') {
        throw new APIError({
            errorCode: 'INVALID_PARAMS',
            objectDetails: { value },
            templateUserMessage:
                'There were invalid integers found in the parameter',
            internalDetails: { value },
        })
    }
}

exports.getAsStringAlphanumeric = function (
    req,
    index,
    defaultvalue,
    required,
    max_length
) {
    const valueout = exports.getAsStringRaw(
        req,
        index,
        defaultvalue,
        required,
        max_length
    )
    if (valueout) {
        // Make sure we only use alphanumeric values
        exports.assertCharValidity(index, valueout, /[^A-Za-z0-9 \_\-\.\@\+]/g)
    }
    // Maximum character length allowed
    return valueout
}

exports.getAsStringNoHtml = function (
    req,
    index,
    defaultvalue,
    required,
    max_length
) {
    const valueout = exports.getAsStringRaw(
        req,
        index,
        defaultvalue,
        required,
        max_length
    )
    if (valueout) {
        // Make sure we only use alphanumeric values
        // exports.assertValidity( index, valueout, /[[^*<\\"\'$#>&;]]/g );
        exports.assertCharValidity(index, valueout, /[\[^*<>&;\]]/g)
    }
    // Maximum character length allowed
    return valueout
}

// Gets the parameter but has no character stripping
exports.getAsURL = function (req, index, defaultvalue, required) {
    const max_length = 256 // Database size is set to 256

    let item = exports.getAsStringRaw(
        req,
        index,
        defaultvalue,
        required,
        max_length
    )

    // Allow empty string
    if (item === '') {
        return item
    }
    // For null values return the defaultvalue
    if (!item) {
        return defaultvalue
    }
    let validURL
    try {
        validURL = new URL(item)
    } catch (err) {
        throw new APIError({
            errorCode: 'INVALID_PARAMS',
            objectDetails: { index, item },
            templateUserMessage: `The parameter${index} URL is invalid, perhaps missing https:// at start?  E.g. use https://link.app instead of link.app`,
            internalDetails: {},
        })
    }

    // If null or 0 we can use the default value
    if (!validURL) {
        item = defaultvalue
    }
    return item
}

// Gets the parameter but has no character stripping
exports.getAsPassword = function (req, index, defaultvalue, required) {
    const max_length = 256 // Database size is set to 256
    return exports.getAsStringRaw(
        req,
        index,
        defaultvalue,
        required,
        max_length
    )
}

// Returns a string or null if null or undefined.
exports.getAsStringRaw = function (
    req,
    index,
    defaultvalue,
    required,
    maxLength,
    getUptoMaxLength
) {
    let valueout = exports.getBodyOrParam(req, index)

    if (valueout === null || valueout === undefined) {
        if (required) {
            throw new APIError({
                errorCode: 'INVALID_PARAMS',
                objectDetails: {
                    [index]: valueout,
                },
                templateUserMessage: [
                    `The parameter '${index}' is required`,
                    `for ${req.originalUrl} API.`,
                    `Currently it is: '${valueout}'`,
                ].join(' '),
            })
        }
        valueout = defaultvalue
    }
    // Default to max 256 characters unless we say otherwise
    if (!maxLength) {
        maxLength = 256
    }

    // If the value is NOT required we allow for returning null.
    if (!required) {
        if (valueout === undefined || valueout === null) {
            return null
        }
    } else {
        if (valueout === undefined) {
            throw new APIError({
                errorCode: 'INVALID_PARAMS',
                objectDetails: {
                    [index]: valueout,
                },
                templateUserMessage: [
                    `The required parameter '${index}' was not supplied`,
                ].join(' '),
            })
        }
        if (valueout === null) {
            throw new APIError({
                errorCode: 'INVALID_PARAMS',
                objectDetails: {
                    [index]: valueout,
                },
                templateUserMessage: [
                    `The required parameter '${index}' was found to be null but should be a string \"\"`,
                ].join(' '),
            })
        }
    }

    if (valueout !== null) {
        // Make sure we are dealing with strings here
        if (typeof valueout === 'number') {
            // Convert the number to a string
            valueout = valueout.toString()
        } else if (typeof valueout !== 'string') {
            throw new APIError({
                errorCode: 'INVALID_PARAMS',
                objectDetails: {
                    [index]: valueout,
                },
                templateUserMessage: [
                    `The parameter '${index}' was found but is not a string`,
                ].join(' '),
            })
        }
        if (getUptoMaxLength && valueout.length > maxLength) {
            /**
             * This will get string right up to the
             * maximum length we have allowed for e.g.
             * HELLO WORLD and we allow maximum length
             * up to 5, then only HELLO will be
             * retrieved and WORLD will be stripped off.
             */
            valueout = valueout.substr(0, maxLength - 4)
            valueout = `${valueout} ...`
        }
        if (valueout.length > maxLength) {
            throw new APIError({
                errorCode: 'INVALID_PARAMS',
                objectDetails: {
                    [index]: valueout,
                    length: valueout.length,
                    maxLength,
                },
                templateUserMessage: [
                    `The parameter '${index}' is too long with '${valueout}'`,
                ].join(' '),
            })
        }
        // Remove leading and trailing spaces
        valueout = valueout.trim()
    }
    return valueout
}

// Remember defaultvalue can be null so that
exports.getNumberInRange = function (req, index, defaultvalue, min, max) {
    const value = exports.getAsNumber(req, index, defaultvalue)
    if (min) {
        if (value < min) {
            throw new APIError({
                errorCode: 'INVALID_PARAMS',
                objectDetails: { min, max, index },
                templateUserMessage: 'value of {{index}} is below {{min}}',
                internalDetails: {},
            })
        }
    }
    if (max) {
        if (value > max) {
            throw new APIError({
                errorCode: 'INVALID_PARAMS',
                objectDetails: { min, max, index },
                templateUserMessage: 'value of {{index}} is above {{max}}',
                internalDetails: {},
            })
        }
    }
    return value
}

exports.getAsNumber = function (req, index, defaultvalue) {
    let valueout = exports.getBodyOrParam(req, index)
    try {
        if (valueout === null || valueout === '') {
            if (defaultvalue != null) {
                valueout = defaultvalue
            } else {
                // Just return nothing
                return null
            }
        }

        let result = parseInt(valueout, 10)
        if (isNaN(result)) {
            result = defaultvalue
        }
        exports.assertIsNumber(result)

        return result
    } catch (e) {
        // debug.warning("Invalid integer value provided to API for index:" + index);
        if (defaultvalue != null) {
            return defaultvalue
        }

        return 0
    }
}

exports.getFloatInRange = function (req, index, defaultvalue, min, max) {
    const value = exports.getAsFloat(req, index, defaultvalue)
    if (min) {
        if (value < min) {
            throw new APIError({
                errorCode: 'INVALID_PARAMS',
                objectDetails: { min, max, index },
                templateUserMessage: 'value of {{index}} is below {{min}}',
                internalDetails: {},
            })
        }
    }
    if (max) {
        if (value > max) {
            throw new APIError({
                errorCode: 'INVALID_PARAMS',
                objectDetails: { min, max, index },
                templateUserMessage: 'value of {{index}} is above {{max}}',
                internalDetails: {},
            })
        }
    }
    return value
}

exports.getAsFloat = function (req, index, defaultvalue) {
    let valueout = exports.getBodyOrParam(req, index)
    if (valueout == null) {
        valueout = defaultvalue
    }
    valueout = parseFloat(valueout)
    if (isNaN(valueout)) {
        valueout = defaultvalue
    }
    if (defaultvalue != null) {
        exports.assertIsNumber(valueout)
    }
    return valueout
}

// This will read in the result and output the JSON object from the input parameter.
// If the input parameter is missing the defaultvalue is used
// If the input parameter is not valid JSON it will instead return a single item array of the text e.g. ["hello"]
exports.getAsJson = function (req, index, defaultvalue) {
    let string_to_process = exports.getBodyOrParam(req, index)

    if (string_to_process == null) {
        string_to_process = defaultvalue
    }
    let jsonresult = {}
    try {
        jsonresult = JSON.parse(string_to_process)
    } catch (e) {
        // debug.log("INVALID JSON:" + e);
        // debug.log("INVALID JSON:" + string_to_process);
        if (string_to_process != null) {
            jsonresult = string_to_process
        } else {
            jsonresult = defaultvalue
        }
    }
    return jsonresult
}

exports.getAsBoolean = function (req, index, defaultvalue) {
    const parsed = exports.getBodyOrParam(req, index)

    let result = defaultvalue

    if (parsed == '1') {
        result = true
    } else if (parsed == 'yes') {
        result = true
    } else if (parsed > 0) {
        result = true
    } else if (parsed == 'YES') {
        result = true
    } else if (parsed == 'true') {
        result = true
    } else if (parsed == 'TRUE') {
        result = true
    } else if (parsed == true) {
        result = true
    } else if (parsed == '0') {
        result = false
    } else if (parsed == 'no') {
        result = false
    } else if (parsed == 0) {
        // For some reason we are getting 0 passed in on defaults so ignore this one (from api docs REST calls)
        // result = false;
    } else if (parsed == 'NO') {
        result = false
    } else if (parsed == 'false') {
        result = false
    } else if (parsed == 'FALSE') {
        result = false
    } else if (parsed == false) {
        result = false
    }
    return result
}

exports.getAsObject = function (req, index, defaultvalue) {
    let parsed = exports.getBodyOrParam(req, index)

    if (parsed == null) {
        parsed = defaultvalue
    }
    parsed = stringHelpers.convertStringToJsonIfNotNull(parsed)
    return parsed
}

exports.validateEmail = function (email) {
    // var re = /\S+@\S+\.\S+/;
    // var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+[^<>()\.,;:\s@\"]{2,})$/;
    const re =
        // eslint-disable-next-line no-control-regex
        /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
    const result = re.test(email)
    if (result == true) {
        // Check for common false emails
        if (email.indexOf('example.com') >= 0) {
            return false
        }
        if (email.indexOf('example.org') >= 0) {
            return false
        }
        if (email.indexOf('satoshin@gmx.com') >= 0) {
            return false
        }
        /**
         * Prevents "gmail" email ending with anything
         * other than "com" is false. Catches typos.
         */
        if (
            String(email).includes('@gmail') &&
            !String(email).endsWith('com')
        ) {
            return false
        }
    }
    return result
}

// Make sure the mobile number is allowed
// @return - Returns true if valid otherwise returns a text string as to why it's invalid
exports.validateMobile = function (mobile) {
    /**
     * This is so that if the player wants to detach their
     * recently requested to add mobile number - for what
     * ever reason they have changed their mind for.
     */
    if (mobile === '') {
        return false
    }

    const is_valid_regex = /^[\+]?[(]?[0-9\ \-\(\)]{10,24}$/
    const is_valid_number = is_valid_regex.test(mobile)
    if (is_valid_number === true) {
        // Check for common false mobiles
        if (
            [
                '911',
                '999',
                '00000000000',
                '11111111111',
                '88888888888',
                '99999999999',
            ].indexOf(mobile) >= 0
        ) {
            return false // "Banned number entered";
        }
    } else {
        return false // "This is not a valid number. Please ensure correct format.";
    }

    return true
}

// Make sure only currency types are allowed and assert if wrong
exports.getAsEmail = function (req, index, defaultvalue, required) {
    const max_length = 256
    let valueout = exports.getAsStringRaw(
        req,
        index,
        defaultvalue,
        required,
        max_length
    )
    if (valueout) {
        valueout = valueout.toLowerCase()
        valueout = valueout.trim()

        // Make sure we only use alphanumeric values
        exports.assertCharValidity(index, valueout, /[^a-z\+\.\@\-0-9\_]/g)

        // Verify a valid email.
        if (!exports.validateEmail(valueout)) {
            throw new APIError({
                errorCode: 'INVALID_PARAM',
                objectDetails: {},
                templateUserMessage: 'The email provided is invalid',
                internalDetails: {},
            })
        }
    }
    return valueout
}
// Make sure only currency types are allowed and assert if wrong
exports.getAsMobile = function (req, index, defaultvalue, required) {
    const max_length = 32
    let valueout = exports.getAsStringRaw(
        req,
        index,
        defaultvalue,
        required,
        max_length
    )
    if (valueout) {
        valueout = valueout.trim()

        // Make sure we only use alphanumeric values
        exports.assertCharValidity(index, valueout, /[^0-9\+\-\ ]/g)

        // Verify a valid email.
        if (!exports.validateMobile(valueout)) {
            throw new APIError({
                errorCode: 'INVALID_PARAM',
                objectDetails: {},
                templateUserMessage: 'The mobile number provided is invalid',
                internalDetails: {},
            })
        }
    }
    return valueout
}

/**
 * Given a REST req parameter from restify, this function will scan through looking for selective paramters of specific types.
 @param array_keys_to_look_for - E.g.
		{
			"display_name" : "string",
			"proposed_email" : "string",
			"proposed_mobile" : "string",
			"status" : "string"
		}
	Make sure the array passed in is an associative array, not a list array.
 */
exports.getArrayProps = function (req, array_keys_to_look_for) {
    const array_objects = {}
    const array_all_keys = Object.keys(array_keys_to_look_for)

    if (typeof array_keys_to_look_for === 'object') {
        if (array_keys_to_look_for.length != null) {
            // This is an array like [ 0,2,5 ] not an object array as expected!
            // debug.assert("A non associative array ( [0,4,6] type array ) has been submitted to get_array_properties_from_request instead of a associative array { 'hi':'string', 'there':'another' }.  This is a source code error that needs fixing");
            return
        }
    }

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < array_all_keys.length; i++) {
        const key = array_all_keys[i]
        const value = array_keys_to_look_for[key]

        if (exports.getBodyOrParam(req, key) != null) {
            let returned_value = null
            if (value == 'string') {
                returned_value = exports.getAsStringAlphanumeric(req, key)
            } else if (value == 'string_no_html') {
                returned_value = exports.getAsStringNoHtml(req, key, null)
            } else if (value == 'url') {
                returned_value = exports.getAsURL(req, key, null)
            } else if (value == 'email') {
                returned_value = exports.getAsEmail(req, key, null)
            } else if (value == 'mobile') {
                returned_value = exports.getAsMobile(req, key, null)
            } else if (value == 'integer') {
                returned_value = exports.getAsNumber(req, key, null)
            } else if (value == 'float') {
                returned_value = exports.getAsFloat(req, key, null)
            } else if (value == 'boolean') {
                returned_value = exports.getAsBoolean(req, key, null)
            } else if (value == 'object') {
                returned_value = exports.getAsObject(req, key, null)
            } else {
                // debug.error("When getting multiple properties, I have no idea what " + key + " is in array_keys_to_look_for[]");
            }
            // Only set the value if it actually existed in the request parameters, skip otherwise
            if (returned_value !== null) {
                array_objects[key] = returned_value
            }
        }
    }

    return array_objects
}
