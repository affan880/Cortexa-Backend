import { z } from 'zod';
export declare const CreateTaskRequestSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>;
    dueDate: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    description?: string | undefined;
    dueDate?: string | undefined;
    tags?: string[] | undefined;
}, {
    title: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    description?: string | undefined;
    dueDate?: string | undefined;
    tags?: string[] | undefined;
}>;
export type CreateTaskRequest = z.infer<typeof CreateTaskRequestSchema>;
export declare const UpdateTaskRequestSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["TODO", "IN_PROGRESS", "COMPLETED", "ARCHIVED"]>>;
    priority: z.ZodOptional<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>>;
    dueDate: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    status?: "TODO" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED" | undefined;
    title?: string | undefined;
    description?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    dueDate?: string | undefined;
    tags?: string[] | undefined;
}, {
    status?: "TODO" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED" | undefined;
    title?: string | undefined;
    description?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    dueDate?: string | undefined;
    tags?: string[] | undefined;
}>;
export type UpdateTaskRequest = z.infer<typeof UpdateTaskRequestSchema>;
export declare const TaskResponseSchema: z.ZodObject<z.objectUtil.extendShape<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<["TODO", "IN_PROGRESS", "COMPLETED", "ARCHIVED"]>;
    priority: z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>;
    dueDate: z.ZodOptional<z.ZodDate>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    userId: z.ZodString;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, {
    dueDate: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}>, "strip", z.ZodTypeAny, {
    status: "TODO" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";
    id: string;
    title: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    createdAt: string;
    updatedAt: string;
    userId: string;
    description?: string | undefined;
    dueDate?: string | undefined;
    tags?: string[] | undefined;
}, {
    status: "TODO" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";
    id: string;
    title: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    createdAt: string;
    updatedAt: string;
    userId: string;
    description?: string | undefined;
    dueDate?: string | undefined;
    tags?: string[] | undefined;
}>;
export type TaskResponse = z.infer<typeof TaskResponseSchema>;
