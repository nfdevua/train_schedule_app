import { UserRole } from 'src/shared/schemas/user.schema';

// this file can be split into multiple files, but not so much data so staying here for now

// Text messages
export const MESSAGES = {
  usernameAlreadyExists: 'Username already exists',
  invalidCredentials: 'Invalid credentials',
  noFavoritesFound: 'No favorites found',
  arrivalTimeMustBeAfterDepartureTime:
    'Arrival time must be after departure time',
  routeNotFound: 'Route not found',
};

// User roles mapping
export const userRoles: Record<string, UserRole> = {
  user: 'user',
  admin: 'admin',
};
