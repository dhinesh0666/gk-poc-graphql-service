/**
 * GK POC GraphQL Service
 * (c) 2025
 */

// Authentication Errors
export const AUTH_ERRORS = {
  TOKEN_EXPIRED: 'Token has expired',
  INVALID_TOKEN: 'Invalid token',
  AUTH_REQUIRED: 'Authentication required',
  USER_NOT_FOUND: 'User not found',
  INVALID_CREDENTIALS: 'Invalid credentials',
  ACCOUNT_INACTIVE: 'Account is inactive or suspended',
  USER_NOT_AUTHENTICATED: 'User not authenticated',
} as const;

// Authorization Errors
export const AUTHORIZATION_ERRORS = {
  INSUFFICIENT_PERMISSIONS: 'Access denied. Insufficient permissions',
  ADMIN_ROLE_REQUIRED: 'Admin role required',
} as const;

// User Errors
export const USER_ERRORS = {
  NOT_FOUND: 'User not found',
  ALREADY_EXISTS: 'User already exists',
  CREATION_FAILED: 'Failed to create user',
  UPDATE_FAILED: 'Failed to update user',
  DELETE_FAILED: 'Failed to delete user',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  LOGIN_SUCCESS: 'Login successful',
} as const;

// App Constants
export const APP_CONSTANTS = {
  ACTIVE_STATUS: 'ACTIVE',
  INACTIVE_STATUS: 'INACTIVE',
  SALT_ROUNDS: 10,
} as const;
