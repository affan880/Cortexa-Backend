"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskListQuerySchema = exports.paginationSchema = exports.taskListResponseSchema = exports.taskResponseSchema = exports.taskIdParamSchema = void 0;
/**
 * API schemas for task endpoints
 */
const zod_1 = require("zod");
const base_types_1 = require("../common/base-types");
const task_schema_1 = require("../models/task.schema");
/**
 * Task ID parameter schema for route parameters
 */
exports.taskIdParamSchema = zod_1.z.object({
    taskId: base_types_1.idSchema,
});
/**
 * API response schemas for various task operations
 */
// Single task response
exports.taskResponseSchema = zod_1.z.object({
    task: task_schema_1.taskSchema,
});
// Task list response
exports.taskListResponseSchema = zod_1.z.object({
    tasks: zod_1.z.array(task_schema_1.taskSchema),
    total: zod_1.z.number().int().nonnegative(),
    page: zod_1.z.number().int().nonnegative().optional(),
    pageSize: zod_1.z.number().int().positive().optional(),
});
// Pagination query parameters
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().nonnegative().default(0),
    pageSize: zod_1.z.coerce.number().int().positive().max(100).default(20),
});
/**
 * Combined schema for task list query (filtering + pagination)
 */
exports.taskListQuerySchema = task_schema_1.taskQuerySchema.merge(exports.paginationSchema);
//# sourceMappingURL=task-api.schema.js.map