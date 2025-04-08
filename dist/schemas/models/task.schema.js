"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskSchema = exports.TaskPriority = exports.TaskStatus = void 0;
const zod_1 = require("zod");
const base_types_1 = require("../common/base-types");
// Task Status enum
exports.TaskStatus = zod_1.z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']);
// Task Priority enum
exports.TaskPriority = zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
// Base Task Schema
exports.TaskSchema = zod_1.z.object({
    id: base_types_1.idSchema,
    title: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().max(1000).optional(),
    status: exports.TaskStatus,
    priority: exports.TaskPriority,
    dueDate: zod_1.z.date().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    userId: base_types_1.idSchema,
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
//# sourceMappingURL=task.schema.js.map