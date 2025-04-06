/**
 * Task schema definition
 */
import { z } from 'zod';
/**
 * Priority levels for tasks
 */
export declare const taskPrioritySchema: z.ZodEnum<["low", "medium", "high", "urgent"]>;
/**
 * Base task schema with fields common to all operations
 */
export declare const taskBaseSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodEnum<["low", "medium", "high", "urgent"]>;
    status: z.ZodEnum<["active", "inactive", "pending"]>;
    dueDate: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "inactive" | "pending";
    title: string;
    priority: "low" | "medium" | "high" | "urgent";
    tags: string[];
    description?: string | undefined;
    dueDate?: string | undefined;
}, {
    status: "active" | "inactive" | "pending";
    title: string;
    priority: "low" | "medium" | "high" | "urgent";
    description?: string | undefined;
    dueDate?: string | undefined;
    tags?: string[] | undefined;
}>;
/**
 * Schema for creating a new task
 */
export declare const taskCreateSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodEnum<["low", "medium", "high", "urgent"]>;
    status: z.ZodEnum<["active", "inactive", "pending"]>;
    dueDate: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "inactive" | "pending";
    title: string;
    priority: "low" | "medium" | "high" | "urgent";
    tags: string[];
    description?: string | undefined;
    dueDate?: string | undefined;
}, {
    status: "active" | "inactive" | "pending";
    title: string;
    priority: "low" | "medium" | "high" | "urgent";
    description?: string | undefined;
    dueDate?: string | undefined;
    tags?: string[] | undefined;
}>;
/**
 * Complete task schema with all properties
 */
export declare const taskSchema: z.ZodObject<z.objectUtil.extendShape<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodEnum<["low", "medium", "high", "urgent"]>;
    status: z.ZodEnum<["active", "inactive", "pending"]>;
    dueDate: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, {
    id: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    userId: z.ZodString;
}>, "strip", z.ZodTypeAny, {
    status: "active" | "inactive" | "pending";
    title: string;
    priority: "low" | "medium" | "high" | "urgent";
    tags: string[];
    id: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    description?: string | undefined;
    dueDate?: string | undefined;
}, {
    status: "active" | "inactive" | "pending";
    title: string;
    priority: "low" | "medium" | "high" | "urgent";
    id: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    description?: string | undefined;
    dueDate?: string | undefined;
    tags?: string[] | undefined;
}>;
/**
 * Schema for updating an existing task
 * All fields are optional for partial updates
 */
export declare const taskUpdateSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    priority: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "urgent"]>>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "pending"]>>;
    dueDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    tags: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny, {
    status?: "active" | "inactive" | "pending" | undefined;
    title?: string | undefined;
    description?: string | undefined;
    priority?: "low" | "medium" | "high" | "urgent" | undefined;
    dueDate?: string | undefined;
    tags?: string[] | undefined;
}, {
    status?: "active" | "inactive" | "pending" | undefined;
    title?: string | undefined;
    description?: string | undefined;
    priority?: "low" | "medium" | "high" | "urgent" | undefined;
    dueDate?: string | undefined;
    tags?: string[] | undefined;
}>;
/**
 * Schema for task filtering/querying
 */
export declare const taskQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "pending"]>>;
    priority: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "urgent"]>>;
    userId: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    dueDateBefore: z.ZodOptional<z.ZodString>;
    dueDateAfter: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "active" | "inactive" | "pending" | undefined;
    priority?: "low" | "medium" | "high" | "urgent" | undefined;
    tags?: string[] | undefined;
    userId?: string | undefined;
    dueDateBefore?: string | undefined;
    dueDateAfter?: string | undefined;
}, {
    status?: "active" | "inactive" | "pending" | undefined;
    priority?: "low" | "medium" | "high" | "urgent" | undefined;
    tags?: string[] | undefined;
    userId?: string | undefined;
    dueDateBefore?: string | undefined;
    dueDateAfter?: string | undefined;
}>;
/**
 * Type definitions using schema inference
 */
export type Task = z.infer<typeof taskSchema>;
export type TaskCreate = z.infer<typeof taskCreateSchema>;
export type TaskUpdate = z.infer<typeof taskUpdateSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;
export type TaskQuery = z.infer<typeof taskQuerySchema>;
