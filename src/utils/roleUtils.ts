import type { User, Group } from '@/types';

/**
 * Role-based utility functions
 *
 * Provides helpers for determining user roles and permissions
 * based on their group memberships.
 */

// Admin group names (case-insensitive matching)
const ADMIN_GROUPS = ['administrators', 'admins', 'admin'];

// Management group names
const MANAGEMENT_GROUPS = ['management team', 'managers', 'management'];

// Check if a user belongs to a specific group
export const isInGroup = (user: User, groupName: string): boolean => {
  return user.groups.some(
    (group) => group.groupName.toLowerCase() === groupName.toLowerCase()
  );
};

// Check if user is an admin
export const isAdmin = (user: User): boolean => {
  return user.groups.some((group) =>
    ADMIN_GROUPS.includes(group.groupName.toLowerCase())
  );
};

// Check if user is in management
export const isManagement = (user: User): boolean => {
  return user.groups.some((group) =>
    MANAGEMENT_GROUPS.includes(group.groupName.toLowerCase())
  );
};

// Check if user has a specific role in any group
export const hasRole = (user: User, roleName: string): boolean => {
  return user.groups.some((group) =>
    group.roles.some(
      (role) => role.roleName.toLowerCase() === roleName.toLowerCase()
    )
  );
};

// Get all roles for a user
export const getAllRoles = (user: User): string[] => {
  const roles = new Set<string>();
  user.groups.forEach((group) => {
    group.roles.forEach((role) => {
      roles.add(role.roleName);
    });
  });
  return Array.from(roles);
};

// Get user's highest privilege level
export type PrivilegeLevel = 'admin' | 'management' | 'standard' | 'readonly';

export const getPrivilegeLevel = (user: User): PrivilegeLevel => {
  if (isAdmin(user)) return 'admin';
  if (isManagement(user)) return 'management';
  if (isInGroup(user, 'Read Only')) return 'readonly';
  return 'standard';
};

// Get badge color based on privilege level
export const getPrivilegeBadgeColor = (
  level: PrivilegeLevel
): 'error' | 'warning' | 'info' | 'default' => {
  switch (level) {
    case 'admin':
      return 'error'; // Red for admins
    case 'management':
      return 'warning'; // Orange for management
    case 'standard':
      return 'info'; // Blue for standard
    case 'readonly':
    default:
      return 'default'; // Gray for readonly
  }
};

// Check if current user can perform action on target user
export const canPerformAction = (
  currentUserLevel: PrivilegeLevel,
  targetUser: User,
  action: 'activate' | 'deactivate' | 'delete'
): boolean => {
  const targetLevel = getPrivilegeLevel(targetUser);

  // Only admins can perform actions on other admins
  if (targetLevel === 'admin' && currentUserLevel !== 'admin') {
    return false;
  }

  // Management and above can perform most actions
  if (action === 'delete') {
    return currentUserLevel === 'admin';
  }

  // Standard users can't perform actions
  if (currentUserLevel === 'standard' || currentUserLevel === 'readonly') {
    return false;
  }

  return true;
};
