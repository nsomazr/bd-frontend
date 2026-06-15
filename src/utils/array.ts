/** Coerce unknown API values to arrays — prevents `.find`/`.map` crashes. */
export function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}
