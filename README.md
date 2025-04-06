# TaskBox Backend - Zod Schema Organization

This Node.js backend application demonstrates best practices for organizing and structuring Zod schemas in a TypeScript project. It provides a structured approach to schema management, validation, and type safety.

## Schema Organization

The project implements a thoughtful schema organization pattern:

```
src/
└── schemas/
    ├── common/             # Base schemas and utilities
    │   ├── base-types.ts   # Reusable primitive schemas
    │   └── schema-helpers.ts  # Validation utilities
    ├── models/             # Domain model schemas
    │   └── task.schema.ts  # Task-related schemas
    ├── api/                # API request/response schemas
    │   └── task-api.schema.ts  # Task API schemas
    └── index.ts            # Central registry and exports
```

## Key Features

- **Single Source of Truth**: Each schema is defined once and reused throughout the application
- **Schema Composition**: Complex schemas are built from smaller, reusable components
- **Type Safety**: TypeScript types are inferred from schemas, ensuring consistency
- **Runtime Validation**: Express middleware for request validation
- **Centralized Registry**: All schemas accessible from a single import

## Design Patterns

### Base Type Schemas

Primitive schemas that serve as building blocks for more complex schemas:

```typescript
// src/schemas/common/base-types.ts
export const idSchema = z.string().uuid({
  message: 'Invalid ID format. Must be a valid UUID',
});

export const emailSchema = z.string().email({
  message: 'Invalid email address format',
});
```

### Domain Model Schemas

Schemas representing core business entities:

```typescript
// src/schemas/models/task.schema.ts
export const taskBaseSchema = z.object({
  title: nonEmptyString,
  description: z.string().optional(),
  priority: taskPrioritySchema,
  status: statusSchema,
  // ...
});

export const taskSchema = taskBaseSchema.extend({
  id: idSchema,
  createdAt: timestampSchema,
  // ...
});
```

### Operation-Specific Schemas

Schemas tailored for specific operations (create, update, query):

```typescript
export const taskCreateSchema = taskBaseSchema;
export const taskUpdateSchema = taskBaseSchema.partial();
export const taskQuerySchema = z.object({/* ... */});
```

### API Request/Response Schemas

Schemas for validating API inputs and outputs:

```typescript
// src/schemas/api/task-api.schema.ts
export const taskResponseSchema = z.object({
  task: taskSchema,
});

export const taskListResponseSchema = z.object({
  tasks: z.array(taskSchema),
  total: z.number().int().nonnegative(),
  // ...
});
```

## Usage Examples

### Middleware Validation

```typescript
// routes/task.routes.ts
router.post(
  '/',
  validate(taskCreateSchema),
  createTask
);
```

### Response Validation

```typescript
// controllers/task.controller.ts
const response = validateResponse(taskResponseSchema, { task });
```

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start development server:
   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   ```

## Best Practices

1. **Keep schemas focused**: Each schema should have a single responsibility
2. **Use meaningful error messages**: Customize validation messages for better UX
3. **Export constants, not types**: Always export schema constants for runtime validation
4. **Document constraints**: Add JSDoc comments explaining validation rules
5. **Compose when possible**: Use `.extend()`, `.merge()`, and `.pick()` for schema composition 