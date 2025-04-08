"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskResponseSchema = exports.UpdateTaskRequestSchema = exports.CreateTaskRequestSchema = void 0;
const zod_1 = require("zod");
const task_schema_1 = require("../models/task.schema");
// Create Task Request Schema
exports.CreateTaskRequestSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().max(1000).optional(),
    priority: task_schema_1.TaskPriority,
    dueDate: zod_1.z.string().datetime().optional(), // Accept ISO date string
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
// Update Task Request Schema
exports.UpdateTaskRequestSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(100).optional(),
    description: zod_1.z.string().max(1000).optional(),
    status: task_schema_1.TaskStatus.optional(),
    priority: task_schema_1.TaskPriority.optional(),
    dueDate: zod_1.z.string().datetime().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
// Task Response Schema (what we send back to clients)
exports.TaskResponseSchema = task_schema_1.TaskSchema.extend({
    dueDate: zod_1.z.string().datetime().optional(), // Convert Date to ISO string
    createdAt: zod_1.z.string().datetime(), // Convert Date to ISO string
    updatedAt: zod_1.z.string().datetime(), // Convert Date to ISO string
});
//# sourceMappingURL=task-api.schema.js.map