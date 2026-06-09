import { isRecord, nullableString, numberOr } from "./internal";

/** Metadata returned alongside every list response. */
export interface Pagination {
  limit: number;
  offset: number;
  count: number;
  /** Absolute URL of the next page, or null at the end. */
  next: string | null;
  /** Absolute URL of the previous page, or null at the start. */
  previous: string | null;
}

/** The generic list envelope: { data, pagination }. */
export interface Page<T> {
  data: T[];
  pagination: Pagination;
}

/** Shared limit/offset paging controls. */
export interface ListOptions {
  limit?: number;
  offset?: number;
}

/**
 * Parse a raw `{ data, pagination }` body into a typed Page, mapping each item
 * with `mapItem`.
 */
export function parsePage<T>(body: unknown, mapItem: (raw: Record<string, unknown>) => T): Page<T> {
  const record = isRecord(body) ? body : {};
  const rawData = Array.isArray(record.data) ? record.data : [];
  const data = rawData.filter(isRecord).map(mapItem);
  const pagination = isRecord(record.pagination) ? record.pagination : {};

  return {
    data,
    pagination: {
      limit: numberOr(pagination.limit),
      offset: numberOr(pagination.offset),
      count: numberOr(pagination.count),
      next: nullableString(pagination.next),
      previous: nullableString(pagination.previous),
    },
  };
}
