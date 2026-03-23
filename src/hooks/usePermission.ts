import { useEnterprise } from '@/context/EnterpriseContext';
import type { Permission } from '@/lib/permissions';

/**
 * Hook to check a single permission. Returns true if the current user has it.
 */
export function usePermission(permission: Permission | string): boolean {
  const { can } = useEnterprise();
  return can(permission);
}

/**
 * Hook to check multiple permissions at once. Returns an object keyed by permission.
 */
export function usePermissions(permissions: (Permission | string)[]): Record<string, boolean> {
  const { can } = useEnterprise();
  const result: Record<string, boolean> = {};
  for (const p of permissions) {
    result[p] = can(p);
  }
  return result;
}
