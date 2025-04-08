import { z } from 'zod';
import { idSchema as id } from '../common/base-types';

// Task Status enum
export const TaskStatus = z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']);
export type TaskStatus = z.infer<typeof TaskStatus>;

// Task Priority enum
export const TaskPriority = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export type TaskPriority = z.infer<typeof TaskPriority>;

// Base Task Schema
export const TaskSchema = z.object({
  id: id,
  title: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  status: TaskStatus,
  priority: TaskPriority,
  dueDate: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: id,
  tags: z.array(z.string()).optional(),
});

export type Task = z.infer<typeof TaskSchema>; 