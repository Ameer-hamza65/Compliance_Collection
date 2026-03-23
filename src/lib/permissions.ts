// RBAC Permissions Engine
// Maps roles to granular permissions. Supports wildcard "*" for super_admin.

export const PERMISSIONS = [
  // User management
  'users.view',
  'users.create',
  'users.update',
  'users.deactivate',
  
  // Roles
  'roles.assign',
  
  // Enterprise
  'enterprise.view',
  'enterprise.update',
  
  // Billing
  'billing.manage',
  
  // Analytics
  'analytics.view',
  'analytics.department',
  
  // Reports
  'reports.view',
  'reports.counter',
  
  // Audit
  'audit.view',
  
  // Collections
  'collections.view',
  'collections.create',
  'collections.manage',
  
  // Add-on builder
  'addon.request',
  
  // Features
  'ai.use',
  'books.upload',
  'books.manage',
  
  // Platform-level
  'platform.manage',
] as const;

export type Permission = typeof PERMISSIONS[number];

export type RBACRole = 'super_admin' | 'admin' | 'compliance_officer' | 'department_manager' | 'staff' | 'rittenhouse_management';

const ROLE_PERMISSIONS: Record<RBACRole, readonly string[]> = {
  super_admin: ['*'],

  admin: [
    'users.view',
    'users.create',
    'users.update',
    'users.deactivate',
    'roles.assign',
    'enterprise.view',
    'enterprise.update',
    'analytics.view',
    'analytics.department',
    'reports.view',
    'reports.counter',
    'audit.view',
    'collections.view',
    'collections.create',
    'collections.manage',
    'addon.request',
    'ai.use',
    'books.upload',
    'books.manage',
  ],

  compliance_officer: [
    'users.view',
    'analytics.view',
    'analytics.department',
    'reports.view',
    'reports.counter',
    'audit.view',
    'collections.view',
    'ai.use',
  ],

  department_manager: [
    'users.view',
    'analytics.department',
    'collections.view',
    'ai.use',
  ],

  staff: [
    'collections.view',
    'ai.use',
  ],

  rittenhouse_management: [
    'analytics.view',
    'analytics.department',
    'reports.view',
    'reports.counter',
    'audit.view',
    'enterprise.view',
    'collections.view',
  ],
};

/**
 * Check if a role has a specific permission.
 * Supports wildcard matching: 'users.*' matches 'users.view', 'users.create', etc.
 */
export function hasPermission(role: RBACRole, permission: Permission | string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  
  // Wildcard — super_admin gets everything
  if (perms.includes('*')) return true;
  
  // Direct match
  if (perms.includes(permission)) return true;
  
  // Wildcard permission check (e.g., role has 'users.*')
  const prefix = permission.split('.')[0];
  if (perms.includes(`${prefix}.*`)) return true;
  
  return false;
}

/**
 * Get all permissions for a role (resolved, no wildcards).
 */
export function getPermissionsForRole(role: RBACRole): string[] {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return [];
  if (perms.includes('*')) return [...PERMISSIONS];
  return [...perms];
}

/**
 * Role hierarchy for display purposes.
 */
export const ROLE_DEFINITIONS: { role: RBACRole; label: string; description: string; level: number }[] = [
  { role: 'super_admin', label: 'Super Admin', description: 'Full platform management across all enterprises', level: 0 },
  { role: 'rittenhouse_management', label: 'Rittenhouse Management', description: 'Read-only reporting across all enterprises', level: 0 },
  { role: 'admin', label: 'Admin', description: 'Full enterprise management', level: 1 },
  { role: 'compliance_officer', label: 'Compliance Officer', description: 'Access reports & compliance tools', level: 2 },
  { role: 'department_manager', label: 'Dept. Manager', description: 'View department analytics', level: 3 },
  { role: 'staff', label: 'Staff', description: 'Read-only access to licensed content', level: 4 },
];
