import { isRecord, nullableRecord, nullableString } from "./internal";

/**
 * Error codes returned by the Octonomy API in the error envelope
 * ({ error: { code: ... } }). They mirror octonomy/core/errors.py on the server.
 */
export const ErrorCode = {
  Validation: "validation_error",
  AuthRequired: "authentication_required",
  Forbidden: "forbidden",
  NotFound: "not_found",
  Conflict: "conflict",
  TenantMismatch: "tenant_mismatch",
  ApplicationMismatch: "application_mismatch",
  InactiveTag: "inactive_tag",
} as const;

export type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode];

/** Base type for every error thrown by the SDK. */
export class OctonomyError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "OctonomyError";
  }
}

/** Thrown when the client is constructed with invalid configuration. */
export class OctonomyConfigError extends OctonomyError {
  constructor(message: string) {
    super(message);
    this.name = "OctonomyConfigError";
  }
}

/**
 * Thrown when the SDK never received a usable HTTP response (connection error,
 * timeout, abort). Inspect `cause` for the underlying error.
 */
export class OctonomyTransportError extends OctonomyError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "OctonomyTransportError";
  }
}

export interface ApiErrorFields {
  statusCode: number;
  code: string;
  message: string;
  details: Record<string, unknown>;
  requestId: string | null;
}

/**
 * Thrown for any non-2xx response. Carries the HTTP status alongside the
 * server's error envelope. Prefer catching the specific subclasses
 * (NotFoundError, ConflictError, ...) where you need to branch.
 */
export class ApiError extends OctonomyError {
  readonly statusCode: number;
  readonly code: string;
  readonly details: Record<string, unknown>;
  readonly requestId: string | null;

  constructor(fields: ApiErrorFields) {
    super(fields.message);
    this.name = "ApiError";
    this.statusCode = fields.statusCode;
    this.code = fields.code;
    this.details = fields.details;
    this.requestId = fields.requestId;
  }

  /**
   * Build the most specific ApiError subclass for a non-2xx response, decoding
   * the standard envelope and falling back to the HTTP status when it is absent.
   */
  static fromResponse(status: number, body: unknown): ApiError {
    const error = isRecord(body) && isRecord(body.error) ? body.error : {};
    const code = nullableString(error.code) ?? codeFromStatus(status);
    const message = nullableString(error.message) ?? `Octonomy request failed with HTTP ${status}`;
    const fields: ApiErrorFields = {
      statusCode: status,
      code,
      message,
      details: nullableRecord(error.details) ?? {},
      requestId: nullableString(error.request_id),
    };
    const Ctor = errorClassFor(code, status);
    return new Ctor(fields);
  }
}

export class ValidationError extends ApiError {
  constructor(fields: ApiErrorFields) {
    super(fields);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends ApiError {
  constructor(fields: ApiErrorFields) {
    super(fields);
    this.name = "AuthenticationError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(fields: ApiErrorFields) {
    super(fields);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends ApiError {
  constructor(fields: ApiErrorFields) {
    super(fields);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends ApiError {
  constructor(fields: ApiErrorFields) {
    super(fields);
    this.name = "ConflictError";
  }
}

/** Type guard: narrows an unknown caught value to ApiError. */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

type ApiErrorConstructor = new (fields: ApiErrorFields) => ApiError;

function errorClassFor(code: string, status: number): ApiErrorConstructor {
  switch (code) {
    case ErrorCode.NotFound:
      return NotFoundError;
    case ErrorCode.Conflict:
      return ConflictError;
    case ErrorCode.Validation:
    case ErrorCode.TenantMismatch:
    case ErrorCode.ApplicationMismatch:
    case ErrorCode.InactiveTag:
      return ValidationError;
    case ErrorCode.AuthRequired:
      return AuthenticationError;
    case ErrorCode.Forbidden:
      return ForbiddenError;
    default:
      return classForStatus(status);
  }
}

function classForStatus(status: number): ApiErrorConstructor {
  switch (status) {
    case 404:
      return NotFoundError;
    case 409:
      return ConflictError;
    case 401:
      return AuthenticationError;
    case 403:
      return ForbiddenError;
    case 400:
      return ValidationError;
    default:
      return ApiError;
  }
}

function codeFromStatus(status: number): string {
  switch (status) {
    case 400:
      return ErrorCode.Validation;
    case 401:
      return ErrorCode.AuthRequired;
    case 403:
      return ErrorCode.Forbidden;
    case 404:
      return ErrorCode.NotFound;
    case 409:
      return ErrorCode.Conflict;
    default:
      return `http_${status}`;
  }
}
