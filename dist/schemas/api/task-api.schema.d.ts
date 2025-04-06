/**
 * API schemas for task endpoints
 */
import { z } from 'zod';
/**
 * Task ID parameter schema for route parameters
 */
export declare const taskIdParamSchema: z.ZodObject<{
    taskId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    taskId: string;
}, {
    taskId: string;
}>;
/**
 * API response schemas for various task operations
 */
export declare const taskResponseSchema: z.ZodObject<{
    task: z.ZodObject<z.objectUtil.extendShape<{
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
}, "strip", z.ZodTypeAny, {
    task: {
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
    };
}, {
    task: {
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
    };
}>;
export declare const taskListResponseSchema: z.ZodObject<{
    tasks: z.ZodArray<z.ZodObject<z.objectUtil.extendShape<{
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
    }>, "many">;
    total: z.ZodNumber;
    page: z.ZodOptional<z.ZodNumber>;
    pageSize: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    tasks: {
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
    }[];
    total: number;
    page?: number | undefined;
    pageSize?: number | undefined;
}, {
    tasks: {
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
    }[];
    total: number;
    page?: number | undefined;
    pageSize?: number | undefined;
}>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
}, {
    page?: number | undefined;
    pageSize?: number | undefined;
}>;
/**
 * Combined schema for task list query (filtering + pagination)
 */
export declare const taskListQuerySchema: z.ZodObject<z.objectUtil.extendShape<{
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "pending"]>>;
    priority: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "urgent"]>>;
    userId: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    dueDateBefore: z.ZodOptional<z.ZodString>;
    dueDateAfter: z.ZodOptional<z.ZodString>;
}, {
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
}>, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
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
    page?: number | undefined;
    pageSize?: number | undefined;
}>;
/**
 * Type definitions using schema inference
 */
export type TaskIdParam = z.infer<typeof taskIdParamSchema>;
export type TaskResponse = z.infer<typeof taskResponseSchema>;
export type TaskListResponse = z.infer<typeof taskListResponseSchema>;
export type TaskListQuery = z.infer<typeof taskListQuerySchema>;
