"use strict";
/**
 * Schema Registry
 *
 * Central export point for all schemas and their types
 * This provides a single import source for consumers of schemas
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaRegistry = void 0;
// Common schemas
__exportStar(require("./common/base-types"), exports);
__exportStar(require("./common/schema-helpers"), exports);
// Model schemas
__exportStar(require("./models/task.schema"), exports);
// API schemas
__exportStar(require("./api/task-api.schema"), exports);
/**
 * Schema Registry
 *
 * This object provides a convenient way to access all schemas in one place
 * It can be useful for documentation and testing purposes
 */
const baseTypes = __importStar(require("./common/base-types"));
const taskSchema = __importStar(require("./models/task.schema"));
const taskApiSchema = __importStar(require("./api/task-api.schema"));
exports.SchemaRegistry = {
    common: {
        ...baseTypes,
    },
    models: {
        task: taskSchema,
    },
    api: {
        task: taskApiSchema,
    },
};
//# sourceMappingURL=index.js.map