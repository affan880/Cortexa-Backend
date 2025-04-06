"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Task Routes
 *
 * Defines API routes for task-related operations
 */
const express_1 = require("express");
const task_controller_1 = require("../controllers/task.controller");
const api_validator_1 = require("../utils/api-validator");
const schemas_1 = require("../schemas");
const router = (0, express_1.Router)();
/**
 * @route GET /tasks
 * @description Get all tasks with optional filtering
 */
router.get('/', (0, api_validator_1.validate)(schemas_1.taskListQuerySchema, 'query'), task_controller_1.getTasks);
/**
 * @route GET /tasks/:taskId
 * @description Get a single task by ID
 */
router.get('/:taskId', (0, api_validator_1.validate)(schemas_1.taskIdParamSchema, 'params'), task_controller_1.getTaskById);
/**
 * @route POST /tasks
 * @description Create a new task
 */
router.post('/', (0, api_validator_1.validate)(schemas_1.taskCreateSchema), task_controller_1.createTask);
exports.default = router;
//# sourceMappingURL=task.routes.js.map