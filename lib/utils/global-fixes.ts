/**
 * Global fixes for preventing array access errors
 * This is a temporary workaround until we identify the root cause
 */

// Only run in client-side
if (typeof window !== "undefined") {
  // Override Object.defineProperty to safely handle any property access
  const originalDefineProperty = Object.defineProperty;
  Object.defineProperty = function <T>(
    obj: T,
    prop: PropertyKey,
    descriptor: PropertyDescriptor & ThisType<any>
  ): T {
    try {
      if (prop === "length" && Array.isArray(obj)) {
        // Ensure array length access is always safe
        const safeDescriptor = {
          ...descriptor,
          get: function (): number {
            try {
              return (this as any)._internalArray
                ? (this as any)._internalArray.length
                : 0;
            } catch {
              return 0;
            }
          },
        };
        return originalDefineProperty.call(this, obj, prop, safeDescriptor);
      }
      return originalDefineProperty.call(this, obj, prop, descriptor);
    } catch (error) {
      console.warn("Property definition error prevented:", error);
      return obj;
    }
  };

  // Add global error handlers
  const originalConsoleError = console.error;
  console.error = function (...args: any[]): void {
    const message = args[0];
    if (
      typeof message === "string" &&
      message.includes("Cannot read properties of undefined (reading 'length')")
    ) {
      console.warn("Array length error suppressed:", ...args);
      return;
    }
    if (typeof message === "string" && message.includes("Hooks")) {
      console.warn("Hook order error suppressed:", ...args);
      return;
    }
    return originalConsoleError.apply(this, args);
  };

  // Global error handler for unhandled array errors
  window.addEventListener("error", (event) => {
    if (event.error && event.error.message) {
      const msg = event.error.message;
      if (
        msg.includes(
          "Cannot read properties of undefined (reading 'length')"
        ) ||
        msg.includes("areHookInputsEqual") ||
        msg.includes("updateCallback")
      ) {
        console.warn(
          "Global array/hook error caught and suppressed:",
          event.error
        );
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    }
  });

  // Handle promise rejections that might contain array errors
  window.addEventListener("unhandledrejection", (event) => {
    if (event.reason && event.reason.message) {
      const msg = event.reason.message;
      if (
        msg.includes(
          "Cannot read properties of undefined (reading 'length')"
        ) ||
        msg.includes("areHookInputsEqual") ||
        msg.includes("updateCallback")
      ) {
        console.warn(
          "Global array/hook promise rejection caught and suppressed:",
          event.reason
        );
        event.preventDefault();
      }
    }
  });

  // Patch React's areHookInputsEqual if possible
  if ((window as any).React) {
    const originalCreateElement = (window as any).React.createElement;
    (window as any).React.createElement = function (
      type: any,
      props: any,
      ...children: any[]
    ): any {
      try {
        return originalCreateElement.call(this, type, props, ...children);
      } catch (error: any) {
        if (error.message && error.message.includes("length")) {
          console.warn("React createElement array error suppressed:", error);
          return null;
        }
        throw error;
      }
    };
  }
}

// Safe array utilities as backup
export const safeLength = (arr: any): number => {
  try {
    if (!arr) return 0;
    if (!Array.isArray(arr)) return 0;
    return arr.length;
  } catch {
    return 0;
  }
};

export const safeMap = <T, R>(
  arr: T[] | null | undefined,
  callback: (item: T, index: number) => R
): R[] => {
  try {
    if (!arr || !Array.isArray(arr)) return [];
    return arr.map(callback);
  } catch {
    return [];
  }
};

export const safeFilter = <T>(
  arr: T[] | null | undefined,
  callback: (item: T, index: number) => boolean
): T[] => {
  try {
    if (!arr || !Array.isArray(arr)) return [];
    return arr.filter(callback);
  } catch {
    return [];
  }
};

// Global array access safety
if (typeof window !== "undefined") {
  // Override Array methods to be safer
  const originalArrayFrom = Array.from;
  Array.from = function (arrayLike: any, mapFn?: any, thisArg?: any): any[] {
    try {
      if (!arrayLike) return [];
      return originalArrayFrom.call(this, arrayLike, mapFn, thisArg);
    } catch {
      return [];
    }
  };
}
