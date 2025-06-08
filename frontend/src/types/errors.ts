export type ApiErrorResponse = {
  message: string;
  error?: string;
  statusCode?: number;
};

export type UserError = {
  name: string;
  message: string;
  statusCode?: number;
  code?: string;
};

export function createUserError(message: string, statusCode?: number, code?: string): UserError {
  return {
    name: 'UserError',
    message,
    statusCode,
    code
  };
} 