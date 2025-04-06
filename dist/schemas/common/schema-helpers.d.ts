/**
 * Helper utilities for schema validation
 */
import { z } from 'zod';
/**
 * Interface for API response structure
 */
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        details?: z.ZodError | string;
    };
}
/**
 * Validates data against a schema and returns a type-safe response
 * @param schema The Zod schema to validate against
 * @param data The data to validate
 * @returns ApiResponse with validated data or error details
 */
export declare function validateSchema<T extends z.ZodType>(schema: T, data: unknown): ApiResponse<z.infer<typeof schema>>;
/**
 * Helper to validate and parse API response data
 * @param schema The Zod schema to validate against
 * @param data The API response data to validate
 * @returns Validated data, or throws a formatted error
 */
export declare function parseData<T extends z.ZodType>(schema: T, data: unknown): z.infer<typeof schema>;
