"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusSchema = exports.urlSchema = exports.positiveNumber = exports.nonEmptyString = exports.timestampSchema = exports.emailSchema = exports.idSchema = void 0;
/**
 * Base type schemas for common data types
 * Provides reusable building blocks for schema composition
 */
const zod_1 = require("zod");
/**
 * ID schema for database records
 */
exports.idSchema = zod_1.z.string().uuid({
    message: 'Invalid ID format. Must be a valid UUID',
});
/**
 * Email schema with validation
 */
exports.emailSchema = zod_1.z.string().email({
    message: 'Invalid email address format',
});
/**
 * Timestamp schema for date fields
 */
exports.timestampSchema = zod_1.z.string().datetime({
    message: 'Invalid timestamp. Must be a valid ISO date string',
});
// Alternative: export const timestampSchema = z.date();
/**
 * Non-empty string schema
 */
exports.nonEmptyString = zod_1.z.string().min(1, {
    message: 'String cannot be empty',
});
/**
 * Positive number schema
 */
exports.positiveNumber = zod_1.z.number().positive({
    message: 'Number must be positive',
});
/**
 * URL schema with validation
 */
exports.urlSchema = zod_1.z.string().url({
    message: 'Invalid URL format',
});
/**
 * Status enum schema
 */
exports.statusSchema = zod_1.z.enum(['active', 'inactive', 'pending']);
//# sourceMappingURL=base-types.js.map