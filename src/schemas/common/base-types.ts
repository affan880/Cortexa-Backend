/**
 * Base type schemas for common data types
 * Provides reusable building blocks for schema composition
 */
import { z } from 'zod';

/**
 * ID schema for database records
 */
export const idSchema = z.string().uuid({
  message: 'Invalid ID format. Must be a valid UUID',
});

/**
 * Email schema with validation
 */
export const emailSchema = z.string().email({
  message: 'Invalid email address format',
});

/**
 * Timestamp schema for date fields
 */
export const timestampSchema = z.string().datetime({
  message: 'Invalid timestamp. Must be a valid ISO date string',
});
// Alternative: export const timestampSchema = z.date();

/**
 * Non-empty string schema
 */
export const nonEmptyString = z.string().min(1, {
  message: 'String cannot be empty',
});

/**
 * Positive number schema
 */
export const positiveNumber = z.number().positive({
  message: 'Number must be positive',
});

/**
 * URL schema with validation
 */
export const urlSchema = z.string().url({
  message: 'Invalid URL format',
});

/**
 * Status enum schema
 */
export const statusSchema = z.enum(['active', 'inactive', 'pending']);

/**
 * Type definitions using schema inference
 */
export type ID = z.infer<typeof idSchema>;
export type Email = z.infer<typeof emailSchema>;
export type Timestamp = z.infer<typeof timestampSchema>;
export type Status = z.infer<typeof statusSchema>; 