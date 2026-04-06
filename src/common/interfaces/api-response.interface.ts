/**
 * GK POC GraphQL Service
 * (c) 2025
 */

export interface GqlApiResponse<T> {
  error: boolean;
  data: T | null;
  errorCode: string;
  message: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
