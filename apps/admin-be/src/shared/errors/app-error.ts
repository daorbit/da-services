/**
 * The error type every route is allowed to throw.
 *
 * A thrown `AppError` is a deliberate, client-visible outcome: the status and
 * message are exactly what the caller receives. Anything else that escapes a
 * handler is a bug, and the error middleware turns it into a bare 500 without
 * leaking its message.
 */
export class AppError extends Error {
  readonly status: number;
  readonly details?: Record<string, unknown>;

  constructor(status: number, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.details = details;
  }
}

export const badRequest = (message: string, details?: Record<string, unknown>) =>
  new AppError(400, message, details);

export const unauthorized = (message = "unauthorized") => new AppError(401, message);

export const forbidden = (message = "forbidden", details?: Record<string, unknown>) =>
  new AppError(403, message, details);

export const notFound = (message = "not found") => new AppError(404, message);

export const conflict = (message: string, details?: Record<string, unknown>) =>
  new AppError(409, message, details);

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}
