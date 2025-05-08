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
    tags?: string[] | undefined;
    description?: string | undefined;
    dueDate?: string | undefined;
}, {
    title: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    tags?: string[] | undefined;
    description?: string | undefined;
    dueDate?: string | undefined;
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
    tags?: string[] | undefined;
    description?: string | undefined;
    title?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    dueDate?: string | undefined;
}, {
    status?: "TODO" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED" | undefined;
    tags?: string[] | undefined;
    description?: string | undefined;
    title?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    dueDate?: string | undefined;
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
    userId: string;
    id: string;
    title: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    createdAt: string;
    updatedAt: string;
    tags?: string[] | undefined;
    description?: string | undefined;
    dueDate?: string | undefined;
}, {
    status: "TODO" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";
    userId: string;
    id: string;
    title: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    createdAt: string;
    updatedAt: string;
    tags?: string[] | undefined;
    description?: string | undefined;
    dueDate?: string | undefined;
}>;
export type TaskResponse = z.infer<typeof TaskResponseSchema>;
