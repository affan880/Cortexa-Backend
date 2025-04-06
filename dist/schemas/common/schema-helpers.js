"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSchema = validateSchema;
exports.parseData = parseData;
/**
 * Helper utilities for schema validation
 */
const zod_1 = require("zod");
/**
 * Validates data against a schema and returns a type-safe response
 * @param schema The Zod schema to validate against
 * @param data The data to validate
 * @returns ApiResponse with validated data or error details
 */
function validateSchema(schema, data) {
    const result = schema.safeParse(data);
    if (!result.success) {
        return {
            success: false,
            error: {
                message: 'Validation failed',
                details: result.error,
            }
        };
    }
    return {
        success: true,
        data: result.data,
    };
}
/**
 * Helper to validate and parse API response data
 * @param schema The Zod schema to validate against
 * @param data The API response data to validate
 * @returns Validated data, or throws a formatted error
 */
function parseData(schema, data) {
    try {
        return schema.parse(data);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            // Format and enhance error for better debugging
            throw new Error(`Validation error: ${JSON.stringify(error.errors)}`);
        }
        throw error;
    }
}
//# sourceMappingURL=schema-helpers.js.map