import { z } from 'zod';
import { TaskSchema, TaskStatus, TaskPriority } from '../models/task.schema';

// Create Task Request Schema
export const CreateTaskRequestSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  priority: TaskPriority,
  dueDate: z.string().datetime().optional(), // Accept ISO date string
  tags: z.array(z.string()).optional(),
});

export type CreateTaskRequest = z.infer<typeof CreateTaskRequestSchema>;

// Update Task Request Schema
export const UpdateTaskRequestSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  status: TaskStatus.optional(),
  priority: TaskPriority.optional(),
  dueDate: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
});

export type UpdateTaskRequest = z.infer<typeof UpdateTaskRequestSchema>;

// Task Response Schema (what we send back to clients)
export const TaskResponseSchema = TaskSchema.extend({
  dueDate: z.string().datetime().optional(), // Convert Date to ISO string
  createdAt: z.string().datetime(), // Convert Date to ISO string
  updatedAt: z.string().datetime(), // Convert Date to ISO string
});

export type TaskResponse = z.infer<typeof TaskResponseSchema>; 