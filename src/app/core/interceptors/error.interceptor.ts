import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AlertService } from '../services/alert.service';

/**
 * HTTP Error Interceptor
 *
 * Intercepts all HTTP errors and displays user-friendly notifications
 * using the AlertService. Handles different types of HTTP errors:
 * - Client-side errors (network issues, etc.)
 * - Server-side errors (4xx, 5xx status codes)
 *
 * Error response structure expected from backend:
 * {
 *   timestamp: string;
 *   status: number;
 *   error: string;
 *   message: string;
 *   path: string;
 * }
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const alertService = inject(AlertService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';
      let errorTitle = 'Error';

      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMessage = `Network error: ${error.error.message}`;
        errorTitle = 'Connection Error';
      } else {
        // Server-side error
        errorTitle = getErrorTitle(error.status);
        errorMessage = extractErrorMessage(error);
      }

      // Show error notification
      alertService.error(errorMessage, errorTitle);

      // Log error to console for debugging
      console.error('HTTP Error:', {
        status: error.status,
        message: errorMessage,
        url: error.url,
        error: error.error
      });

      // Re-throw the error so components can handle it if needed
      return throwError(() => error);
    })
  );
};

/**
 * Extracts error message from HTTP error response
 */
function extractErrorMessage(error: HttpErrorResponse): string {
  // Try to get message from error response body
  if (error.error?.message) {
    return error.error.message;
  }

  // Fallback to generic messages based on status code
  switch (error.status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Unauthorized. Please login again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'Conflict. The resource already exists.';
    case 422:
      return 'Validation failed. Please check your input.';
    case 500:
      return 'Internal server error. Please try again later.';
    case 503:
      return 'Service unavailable. Please try again later.';
    default:
      return `Error ${error.status}: ${error.statusText || 'Unknown error'}`;
  }
}

/**
 * Gets appropriate error title based on HTTP status code
 */
function getErrorTitle(status: number): string {
  if (status >= 400 && status < 500) {
    return 'Request Error';
  }
  if (status >= 500) {
    return 'Server Error';
  }
  return 'Error';
}
