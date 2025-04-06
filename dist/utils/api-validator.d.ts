/**
 * API Validation Utilities
 *
 * Middleware and helper functions for validating API requests and responses
 */
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, z } from 'zod';
/**
 * Express middleware factory for validating request components
 * @param schema The schema to validate against
 * @param source Which part of the request to validate
 * @returns Express middleware function
 */
export declare function validate(schema: AnyZodObject, source?: 'body' | 'query' | 'params'): (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
/**
 * Validate API response data before sending
 * @param schema The schema to validate against
 * @param data The data to validate and send
 * @returns Validated response data
 */
export declare function validateResponse<T extends z.ZodType>(schema: T, data: unknown): z.infer<typeof schema>;
