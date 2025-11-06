"use client";

import { useEffect } from "react";

/**
 * Suppresses known harmless console errors from Recharts + React 19 compatibility issues
 * These errors don't affect functionality, only create console noise
 */
export default function ConsoleErrorSuppressor() {
  useEffect(() => {
    // Store original console.error
    const originalError = console.error;

    // Override console.error to filter out known harmless warnings
    console.error = (...args: unknown[]) => {
      // Check if this is a known Recharts + React 19 type warning
      if (
        typeof args[0] === "string" &&
        (args[0].includes("popupClassName") ||
          args[0].includes("TooltipProps") ||
          args[0].includes("not assignable to type 'IntrinsicAttributes"))
      ) {
        // Suppress this specific error
        return;
      }

      // Pass all other errors through
      originalError.apply(console, args);
    };

    // Cleanup: restore original console.error on unmount
    return () => {
      console.error = originalError;
    };
  }, []);

  return null; // This component doesn't render anything
}

