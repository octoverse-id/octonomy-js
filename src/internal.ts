/**
 * Small, defensive helpers for reading values out of a decoded JSON body. They
 * never throw on a missing/mismatched field — they return a safe fallback — so
 * model mapping stays total.
 *
 * @internal
 */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function stringOr(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function nullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export function numberOr(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function boolOr(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function nullableRecord(value: unknown): Record<string, unknown> | null {
  return isRecord(value) ? value : null;
}

export function parseDate(value: unknown): Date {
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return new Date(0);
}
