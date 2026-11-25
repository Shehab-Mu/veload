/**
 * Converts a numeric or string length into a CSS length.
 *
 * Numeric values are interpreted as pixels and clamped to zero. Invalid
 * numeric values and blank strings fall back to `fallback`.
 */
export function toCssLength(
  value: number | string | null | undefined,
  fallback: string,
): string {
  if (typeof value === "number") {
    return Number.isFinite(value) ? `${Math.max(0, value)}px` : fallback;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }

  return fallback;
}
