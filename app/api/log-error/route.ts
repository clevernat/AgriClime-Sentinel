import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/log-error
 * 
 * Endpoint for logging client-side errors to the server.
 * In production, this should forward errors to a monitoring service
 * like Sentry, LogRocket, Rollbar, or Datadog.
 */
export async function POST(request: NextRequest) {
  try {
    const errorData = await request.json();

    // Validate error data
    if (!errorData.message) {
      return NextResponse.json(
        { error: "Error message is required" },
        { status: 400 }
      );
    }

    // Prepare error log entry
    const logEntry = {
      timestamp: errorData.timestamp || new Date().toISOString(),
      message: errorData.message,
      stack: errorData.stack,
      componentStack: errorData.componentStack,
      userAgent: errorData.userAgent,
      url: errorData.url,
      // Additional context
      environment: process.env.NODE_ENV,
      version: process.env.NEXT_PUBLIC_APP_VERSION || "unknown",
    };

    // In development, just log to console
    if (process.env.NODE_ENV === "development") {
      console.error("Client Error Logged:", logEntry);
    }

    // TODO: In production, send to error monitoring service
    // Example integrations:
    
    // Sentry:
    // import * as Sentry from "@sentry/nextjs";
    // Sentry.captureException(new Error(errorData.message), {
    //   extra: logEntry,
    // });

    // LogRocket:
    // LogRocket.captureException(new Error(errorData.message), {
    //   extra: logEntry,
    // });

    // Custom logging service:
    // await fetch(process.env.ERROR_LOGGING_ENDPOINT!, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(logEntry),
    // });

    return NextResponse.json({
      success: true,
      message: "Error logged successfully",
    });
  } catch (error) {
    // Don't throw errors in error logging endpoint
    // Just return success to prevent infinite loops
    return NextResponse.json({
      success: false,
      message: "Failed to log error",
    });
  }
}

