export { userColumnMetadata } from './columnConfig';
export {
  isAdmin,
  isManagement,
  isInGroup,
  hasRole,
  getAllRoles,
  getPrivilegeLevel,
  getPrivilegeBadgeColor,
  canPerformAction,
} from './roleUtils';
export type { PrivilegeLevel } from './roleUtils';

/**
 * Format date string to readable format
 */
export const formatDate = (dateString: string, format?: string): string => {
  const date = new Date(dateString);

  if (format === 'YYYY-MM-DD') {
    return date.toISOString().split('T')[0];
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
