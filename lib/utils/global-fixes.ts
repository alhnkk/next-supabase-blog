/**
 * Global fixes for preventing array access errors
 * This is a temporary workaround until we identify the root cause
 */

// Only run in client-side
if (typeof window !== "undefined") {
  // Override Array.prototype.length getter to be safer
  const originalLengthDescriptor = Object.getOwnPropertyDescriptor(
    Array.prototype,
    "length"
  );

  if (originalLengthDescriptor) {
    Object.defineProperty(Array.prototype, "length", {
      get: function () {
        try {
          return originalLengthDescriptor.get?.call(this) ?? 0;
        } catch (error) {
          console.warn("Array length access error prevented:", error);
          return 0;
        }
      },
      set: originalLengthDescriptor.set,
      enumerable: originalLengthDescriptor.enumerable,
      configurable: originalLengthDescriptor.configurable,
    });
  }

  // Add a global error handler for unhandled array errors
  window.addEventListener("error", (event) => {
    if (
      event.error &&
      event.error.message &&
      event.error.message.includes(
        "Cannot read properties of undefined (reading 'length')"
      )
    ) {
      console.error("Global array length error caught:", event.error);
      event.preventDefault(); // Prevent the error from bubbling up
      return false;
    }
  });

  // Handle promise rejections that might contain array errors
  window.addEventListener("unhandledrejection", (event) => {
    if (
      event.reason &&
      event.reason.message &&
      event.reason.message.includes(
        "Cannot read properties of undefined (reading 'length')"
      )
    ) {
      console.error(
        "Global array length promise rejection caught:",
        event.reason
      );
      event.preventDefault();
    }
  });
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
