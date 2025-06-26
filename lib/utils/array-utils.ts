/**
 * Safe array utilities to prevent undefined access errors
 */

export function safeArrayLength(arr: any): number {
  if (!Array.isArray(arr)) return 0;
  return arr.length;
}

export function safeArrayMap<T, R>(
  arr: T[] | undefined | null,
  callback: (item: T, index: number, array: T[]) => R
): R[] {
  if (!Array.isArray(arr)) return [];
  return arr.map(callback);
}

export function safeArrayFilter<T>(
  arr: T[] | undefined | null,
  callback: (item: T, index: number, array: T[]) => boolean
): T[] {
  if (!Array.isArray(arr)) return [];
  return arr.filter(callback);
}

export function safeArrayFind<T>(
  arr: T[] | undefined | null,
  callback: (item: T, index: number, array: T[]) => boolean
): T | undefined {
  if (!Array.isArray(arr)) return undefined;
  return arr.find(callback);
}

export function safeArrayIncludes<T>(
  arr: T[] | undefined | null,
  searchElement: T
): boolean {
  if (!Array.isArray(arr)) return false;
  return arr.includes(searchElement);
}

export function safeArrayForEach<T>(
  arr: T[] | undefined | null,
  callback: (item: T, index: number, array: T[]) => void
): void {
  if (!Array.isArray(arr)) return;
  arr.forEach(callback);
}

export function ensureArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}
