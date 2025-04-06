/**
 * Task Controller
 *
 * Handles task-related API endpoints
 */
import { Request, Response } from 'express';
/**
 * Get all tasks with optional filtering
 */
export declare function getTasks(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
/**
 * Get a single task by ID
 */
export declare function getTaskById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
/**
 * Create a new task
 */
export declare function createTask(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
