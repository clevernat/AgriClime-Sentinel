/**
 * Client-side error logging utility
 * 
 * Provides functions to log errors to the server and/or external monitoring services.
 * In production, this should integrate with services like Sentry, LogRocket, or Datadog.
 */

interface ErrorLogData {
  message: string;
  stack?: string;
  componentStack?: string;
  userAgent?: string;
  url?: string;
  timestamp?: string;
  context?: Record<string, unknown>;
}

/**
 * Log an error to the server
 */
export async function logError(error: Error, context?: Record<string, unknown>): Promise<void> {
  try {
    const errorData: ErrorLogData = {
      message: error.message,
      stack: error.stack,
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
      url: typeof window !== "undefined" ? window.location.href : undefined,
      timestamp: new Date().toISOString(),
      context,
    };

    // Send to server endpoint
    await fetch("/api/log-error", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(errorData),
    });
  } catch (loggingError) {
    // Don't throw errors in error logging
    // Just log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to log error:", loggingError);
    }
  }
}

/**
 * Log a custom message as an error
 */
export async function logMessage(
  message: string,
  context?: Record<string, unknown>
): Promise<void> {
  const error = new Error(message);
  await logError(error, context);
}

/**
 * Setup global error handlers
 * Call this once in your app initialization
 */
export function setupGlobalErrorHandlers(): void {
  if (typeof window === "undefined") return;

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
    
    logError(error, {
      type: "unhandledRejection",
      promise: event.promise,
    });

    if (process.env.NODE_ENV === "development") {
      console.error("Unhandled promise rejection:", event.reason);
    }
  });

  // Handle global errors
  window.addEventListener("error", (event) => {
    const error = event.error instanceof Error
      ? event.error
      : new Error(event.message);

    logError(error, {
      type: "globalError",
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });

    if (process.env.NODE_ENV === "development") {
      console.error("Global error:", event.error);
    }
  });
}

/**
 * Performance monitoring utility
 * Track slow operations and log them
 */
export async function trackPerformance(
  operationName: string,
  duration: number,
  threshold: number = 3000 // 3 seconds default
): Promise<void> {
  if (duration > threshold) {
    await logMessage(`Slow operation: ${operationName}`, {
      type: "performance",
      operationName,
      duration,
      threshold,
    });
  }
}

/**
 * Wrapper for async operations with error logging
 */
export async function withErrorLogging<T>(
  operation: () => Promise<T>,
  operationName: string,
  context?: Record<string, unknown>
): Promise<T | null> {
  const startTime = performance.now();
  
  try {
    const result = await operation();
    const duration = performance.now() - startTime;
    
    // Track performance
    await trackPerformance(operationName, duration);
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    
    await logError(
      error instanceof Error ? error : new Error(String(error)),
      {
        ...context,
        operationName,
        duration,
      }
    );
    
    return null;
  }
}

