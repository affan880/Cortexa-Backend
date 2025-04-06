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
export function validateSchema<T extends z.ZodType>(
  schema: T,
  data: unknown
): ApiResponse<z.infer<typeof schema>> {
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
export function parseData<T extends z.ZodType>(
  schema: T,
  data: unknown
): z.infer<typeof schema> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format and enhance error for better debugging
      throw new Error(`Validation error: ${JSON.stringify(error.errors)}`);
    }
    throw error;
  }
} 