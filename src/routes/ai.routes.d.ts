import { Router } from 'express';

// Declare the module using the relative path it will be imported with
declare module './ai.routes' {
  const router: Router;
  export default router;
} 