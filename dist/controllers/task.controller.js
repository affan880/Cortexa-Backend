"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTasks = getTasks;
exports.getTaskById = getTaskById;
exports.createTask = createTask;
const api_validator_1 = require("../utils/api-validator");
const schemas_1 = require("../schemas");
// Mock data for demonstration purposes
const mockTasks = [
    {
        id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        title: 'Complete project documentation',
        description: 'Write up technical docs for the new API',
        priority: 'high',
        status: 'active',
        dueDate: new Date().toISOString(),
        tags: ['documentation', 'technical'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
    },
];
/**
 * Get all tasks with optional filtering
 */
async function getTasks(req, res) {
    try {
        // The middleware will have validated and transformed query to match our schema
        const { page = 0, pageSize = 20 } = req.query;
        // Validate response data against schema
        const response = (0, api_validator_1.validateResponse)(schemas_1.taskListResponseSchema, {
            tasks: mockTasks,
            total: mockTasks.length,
            page,
            pageSize,
        });
        return res.status(200).json({
            success: true,
            ...response,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: {
                message: 'Failed to retrieve tasks',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
        });
    }
}
/**
 * Get a single task by ID
 */
async function getTaskById(req, res) {
    try {
        // In a real app, you would fetch from database by ID
        const { taskId } = req.params;
        const task = mockTasks.find(t => t.id === taskId);
        if (!task) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Task not found',
                },
            });
        }
        // Validate response data against schema
        const response = (0, api_validator_1.validateResponse)(schemas_1.taskResponseSchema, { task });
        return res.status(200).json({
            success: true,
            ...response,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: {
                message: 'Failed to retrieve task',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
        });
    }
}
/**
 * Create a new task
 */
async function createTask(req, res) {
    try {
        // req.body is already validated by middleware
        const taskData = req.body;
        // In a real app, you would save to database
        const newTask = {
            ...taskData,
            id: 'new-uuid-here', // In real app, generate UUID
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: 'current-user-id', // In real app, get from auth context
        };
        // Validate the task against the full schema
        const validatedTask = (0, api_validator_1.validateResponse)(schemas_1.taskSchema, newTask);
        // Validate response data against schema
        const response = (0, api_validator_1.validateResponse)(schemas_1.taskResponseSchema, { task: validatedTask });
        return res.status(201).json({
            success: true,
            ...response,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: {
                message: 'Failed to create task',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
        });
    }
}
//# sourceMappingURL=task.controller.js.map