import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  // Clean structured output
  res.status(status).json({
    status: 'error',
    statusCode: status,
    message,
    code: err.code || 'INTERNAL_ERROR',
    details: err.details || null,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
}
