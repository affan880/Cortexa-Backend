/**
 * Base type schemas for common data types
 * Provides reusable building blocks for schema composition
 */
import { z } from 'zod';
/**
 * ID schema for database records
 */
export declare const idSchema: z.ZodString;
/**
 * Email schema with validation
 */
export declare const emailSchema: z.ZodString;
/**
 * Timestamp schema for date fields
 */
export declare const timestampSchema: z.ZodString;
/**
 * Non-empty string schema
 */
export declare const nonEmptyString: z.ZodString;
/**
 * Positive number schema
 */
export declare const positiveNumber: z.ZodNumber;
/**
 * URL schema with validation
 */
export declare const urlSchema: z.ZodString;
/**
 * Status enum schema
 */
export declare const statusSchema: z.ZodEnum<["active", "inactive", "pending"]>;
/**
 * Type definitions using schema inference
 */
export type ID = z.infer<typeof idSchema>;
export type Email = z.infer<typeof emailSchema>;
export type Timestamp = z.infer<typeof timestampSchema>;
export type Status = z.infer<typeof statusSchema>;
