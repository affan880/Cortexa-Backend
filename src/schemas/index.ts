/**
 * Schema Registry
 * 
 * Central export point for all schemas and their types
 * This provides a single import source for consumers of schemas
 */

// Common schemas
export * from './common/base-types';
export * from './common/schema-helpers';

// Model schemas
export * from './models/task.schema';

// API schemas
export * from './api/task-api.schema';

/**
 * Schema Registry
 * 
 * This object provides a convenient way to access all schemas in one place
 * It can be useful for documentation and testing purposes
 */
import * as baseTypes from './common/base-types';
import * as taskSchema from './models/task.schema';
import * as taskApiSchema from './api/task-api.schema';

export const SchemaRegistry = {
  common: {
    ...baseTypes,
  },
  models: {
    task: taskSchema,
  },
  api: {
    task: taskApiSchema,
  },
}; 