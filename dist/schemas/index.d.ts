/**
 * Schema Registry
 *
 * Central export point for all schemas and their types
 * This provides a single import source for consumers of schemas
 */
export * from './common/base-types';
export * from './common/schema-helpers';
export declare const SchemaRegistry: {
    common: {
        idSchema: import("zod").ZodString;
        emailSchema: import("zod").ZodString;
        timestampSchema: import("zod").ZodString;
        nonEmptyString: import("zod").ZodString;
        positiveNumber: import("zod").ZodNumber;
        urlSchema: import("zod").ZodString;
        statusSchema: import("zod").ZodEnum<["active", "inactive", "pending"]>;
    };
};
