"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
exports.validateResponse = validateResponse;
const zod_1 = require("zod");
/**
 * Express middleware factory for validating request components
 * @param schema The schema to validate against
 * @param source Which part of the request to validate
 * @returns Express middleware function
 */
function validate(schema, source = 'body') {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req[source]);
            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: `Invalid ${source} data`,
                        details: result.error.format(),
                    },
                });
            }
            // Replace the request object's data with the validated data
            req[source] = result.data;
            return next();
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                error: {
                    message: 'Validation error',
                    details: error instanceof Error ? error.message : 'Unknown error',
                },
            });
        }
    };
}
/**
 * Validate API response data before sending
 * @param schema The schema to validate against
 * @param data The data to validate and send
 * @returns Validated response data
 */
function validateResponse(schema, data) {
    try {
        return schema.parse(data);
    }
    catch (error) {
        console.error('Response validation error:', error);
        if (error instanceof zod_1.z.ZodError) {
            // In development, you might want to throw this error
            throw new Error(`Response validation error: ${JSON.stringify(error.errors)}`);
        }
        throw error;
    }
}
//# sourceMappingURL=api-validator.js.map