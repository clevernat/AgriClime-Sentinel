# Error Monitoring Setup

## Overview

AgriClime Sentinel includes a comprehensive error monitoring system to catch, log, and track errors in production.

## Components

### 1. Error Boundary (`components/ErrorBoundary.tsx`)

A React Error Boundary component that catches JavaScript errors anywhere in the component tree.

**Features:**
- Catches rendering errors in React components
- Displays user-friendly error UI
- Logs errors to monitoring service
- Provides recovery options (Try Again, Reload, Go Home)
- Shows stack traces in development mode

**Usage:**
```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

The root layout (`app/layout.tsx`) already wraps the entire app with ErrorBoundary.

### 2. Error Logging API (`app/api/log-error/route.ts`)

Server endpoint for logging client-side errors.

**Endpoint:** `POST /api/log-error`

**Request Body:**
```json
{
  "message": "Error message",
  "stack": "Error stack trace",
  "componentStack": "React component stack",
  "userAgent": "Browser user agent",
  "url": "Page URL where error occurred",
  "timestamp": "ISO timestamp"
}
```

### 3. Error Logger Utility (`lib/utils/error-logger.ts`)

Client-side utility for logging errors programmatically.

**Functions:**

#### `logError(error: Error, context?: object)`
Log an error with optional context:
```typescript
import { logError } from '@/lib/utils/error-logger';

try {
  // risky operation
} catch (error) {
  await logError(error, { userId: '123', action: 'fetchData' });
}
```

#### `logMessage(message: string, context?: object)`
Log a custom error message:
```typescript
await logMessage('API rate limit exceeded', { endpoint: '/api/data' });
```

#### `setupGlobalErrorHandlers()`
Setup global error handlers (call once in app initialization):
```typescript
import { setupGlobalErrorHandlers } from '@/lib/utils/error-logger';

// In your app initialization
setupGlobalErrorHandlers();
```

#### `trackPerformance(operationName: string, duration: number, threshold?: number)`
Track slow operations:
```typescript
const start = performance.now();
await fetchData();
const duration = performance.now() - start;
await trackPerformance('fetchData', duration, 3000); // 3s threshold
```

#### `withErrorLogging(operation: () => Promise<T>, operationName: string, context?: object)`
Wrapper for async operations with automatic error logging:
```typescript
const data = await withErrorLogging(
  () => fetch('/api/data').then(r => r.json()),
  'fetchData',
  { userId: '123' }
);
```

## Integration with External Services

### Sentry (Recommended)

1. **Install Sentry:**
```bash
npm install @sentry/nextjs
```

2. **Initialize Sentry:**
Create `sentry.client.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

3. **Update ErrorBoundary:**
In `components/ErrorBoundary.tsx`, update `logErrorToService`:
```typescript
import * as Sentry from "@sentry/nextjs";

logErrorToService(error: Error, errorInfo: ErrorInfo) {
  Sentry.captureException(error, {
    extra: {
      componentStack: errorInfo.componentStack,
    },
  });
}
```

4. **Update error-logger.ts:**
```typescript
import * as Sentry from "@sentry/nextjs";

export async function logError(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, { extra: context });
}
```

### LogRocket

1. **Install LogRocket:**
```bash
npm install logrocket
```

2. **Initialize LogRocket:**
```typescript
import LogRocket from 'logrocket';

LogRocket.init(process.env.NEXT_PUBLIC_LOGROCKET_APP_ID!);
```

3. **Integrate with error logging:**
```typescript
import LogRocket from 'logrocket';

export async function logError(error: Error, context?: Record<string, unknown>) {
  LogRocket.captureException(error, { extra: context });
}
```

### Datadog

1. **Install Datadog:**
```bash
npm install @datadog/browser-logs
```

2. **Initialize Datadog:**
```typescript
import { datadogLogs } from '@datadog/browser-logs';

datadogLogs.init({
  clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN!,
  site: 'datadoghq.com',
  forwardErrorsToLogs: true,
  sessionSampleRate: 100,
});
```

## Environment Variables

Add to `.env.local`:

```bash
# Sentry
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here

# LogRocket
NEXT_PUBLIC_LOGROCKET_APP_ID=your_logrocket_app_id_here

# Datadog
NEXT_PUBLIC_DATADOG_CLIENT_TOKEN=your_datadog_client_token_here

# App version for error tracking
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## Best Practices

### 1. Always wrap risky operations
```typescript
try {
  const data = await fetchData();
} catch (error) {
  await logError(error, { operation: 'fetchData' });
  // Handle error gracefully
}
```

### 2. Add context to errors
```typescript
await logError(error, {
  userId: user.id,
  action: 'submitForm',
  formData: sanitizedFormData,
});
```

### 3. Use Error Boundaries for component errors
```tsx
<ErrorBoundary fallback={<CustomErrorUI />}>
  <ComplexComponent />
</ErrorBoundary>
```

### 4. Track performance issues
```typescript
const start = performance.now();
await heavyOperation();
await trackPerformance('heavyOperation', performance.now() - start);
```

### 5. Setup global handlers early
```typescript
// In app/layout.tsx or _app.tsx
import { setupGlobalErrorHandlers } from '@/lib/utils/error-logger';

useEffect(() => {
  setupGlobalErrorHandlers();
}, []);
```

## Testing Error Monitoring

### Test Error Boundary
Create a component that throws an error:
```tsx
function BrokenComponent() {
  throw new Error('Test error boundary');
  return <div>This will never render</div>;
}

// Use it
<ErrorBoundary>
  <BrokenComponent />
</ErrorBoundary>
```

### Test Error Logging
```typescript
import { logError, logMessage } from '@/lib/utils/error-logger';

// Test error logging
await logError(new Error('Test error'), { test: true });

// Test message logging
await logMessage('Test message', { test: true });
```

### Test Global Handlers
```typescript
// Trigger unhandled rejection
Promise.reject(new Error('Test unhandled rejection'));

// Trigger global error
throw new Error('Test global error');
```

## Monitoring Dashboard

Once integrated with a service like Sentry, you'll have access to:

- **Error tracking**: See all errors with stack traces
- **User impact**: Know how many users are affected
- **Performance monitoring**: Track slow operations
- **Release tracking**: Compare error rates across versions
- **Alerts**: Get notified of critical errors
- **Session replay**: See what users did before the error

## Current Status

✅ **Implemented:**
- Error Boundary component
- Error logging API endpoint
- Client-side error logger utility
- Global error handlers
- Performance tracking

⏳ **TODO (Before Production):**
- [ ] Choose and integrate external monitoring service (Sentry recommended)
- [ ] Set up error alerting
- [ ] Configure error sampling rates
- [ ] Add user identification to error logs
- [ ] Set up performance monitoring thresholds
- [ ] Create error monitoring dashboard
- [ ] Test error monitoring in staging environment

## Support

For questions or issues with error monitoring setup, refer to:
- [Sentry Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [LogRocket Documentation](https://docs.logrocket.com/)
- [Datadog Documentation](https://docs.datadoghq.com/logs/log_collection/javascript/)

