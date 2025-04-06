"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskQuerySchema = exports.taskUpdateSchema = exports.taskSchema = exports.taskCreateSchema = exports.taskBaseSchema = exports.taskPrioritySchema = void 0;
/**
 * Task schema definition
 */
const zod_1 = require("zod");
const base_types_1 = require("../common/base-types");
/**
 * Priority levels for tasks
 */
exports.taskPrioritySchema = zod_1.z.enum(['low', 'medium', 'high', 'urgent']);
/**
 * Base task schema with fields common to all operations
 */
exports.taskBaseSchema = zod_1.z.object({
    title: base_types_1.nonEmptyString,
    description: zod_1.z.string().optional(),
    priority: exports.taskPrioritySchema,
    status: base_types_1.statusSchema,
    dueDate: base_types_1.timestampSchema.optional(),
    tags: zod_1.z.array(base_types_1.nonEmptyString).default([]),
});
/**
 * Schema for creating a new task
 */
exports.taskCreateSchema = exports.taskBaseSchema;
/**
 * Complete task schema with all properties
 */
exports.taskSchema = exports.taskBaseSchema.extend({
    id: base_types_1.idSchema,
    createdAt: base_types_1.timestampSchema,
    updatedAt: base_types_1.timestampSchema,
    userId: base_types_1.idSchema,
});
/**
 * Schema for updating an existing task
 * All fields are optional for partial updates
 */
exports.taskUpdateSchema = exports.taskBaseSchema.partial();
/**
 * Schema for task filtering/querying
 */
exports.taskQuerySchema = zod_1.z.object({
    status: base_types_1.statusSchema.optional(),
    priority: exports.taskPrioritySchema.optional(),
    userId: base_types_1.idSchema.optional(),
    tags: zod_1.z.array(base_types_1.nonEmptyString).optional(),
    dueDateBefore: base_types_1.timestampSchema.optional(),
    dueDateAfter: base_types_1.timestampSchema.optional(),
});
//# sourceMappingURL=task.schema.js.map