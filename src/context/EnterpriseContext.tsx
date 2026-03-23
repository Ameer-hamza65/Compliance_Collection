import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  LicensingTier,
  TierDefinition,
  getTierDefinition,
  isWithinSeatLimit,
} from '@/data/complianceData';
import { EnterpriseRole } from '@/data/mockEnterpriseData';
import { hasPermission, type RBACRole, type Permission } from '@/lib/permissions';

// DB-backed interfaces
export interface EnterpriseData {
  id: string;
  name: string;
  type: string;
  domain: string;
  contactEmail: string;
  licenseSeats: number;
  usedSeats: number;
  licensingTier: LicensingTier;
  logoColor: string;
  createdAt: string;
}

export interface EnterpriseUser {
  id: string;
  email: string;
  name: string;
  enterpriseId: string;
  departmentIds: string[];
  role: EnterpriseRole;
  jobTitle?: string;
  isActive: boolean;
  lastAccess?: string;
}

export interface DepartmentData {
  id: string;
  enterpriseId: string;
  name: string;
  description?: string;
}

export interface CollectionData {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  bookIds: string[];
  isSystemBundle: boolean;
  enterpriseId?: string;
}

export interface BookAccessData {
  id: string;
  enterpriseId: string;
  bookId: string;
  accessLevel: string;
  grantedAt: string;
  expiresAt?: string;
}

interface EnterpriseContextType {
  currentEnterprise: EnterpriseData | null;
  currentUser: EnterpriseUser | null;
  isEnterpriseMode: boolean;
  isPlatformAdmin: boolean;
  
  enterprises: EnterpriseData[];
  departments: DepartmentData[];
  users: EnterpriseUser[];
  collections: CollectionData[];
  bookAccess: BookAccessData[];
  auditLogs: any[];
  
  currentTier: TierDefinition | null;
  
  isSeatLimitExceeded: boolean;
  seatUtilizationPercent: number;
  
  loginAsEnterpriseUser: (userId: string) => void;
  loginAsEnterprise: (enterpriseId: string, role?: EnterpriseRole) => void;
  logoutEnterprise: () => void;
  
  hasBookAccess: (bookId: string) => boolean;
  canAccessCollectionByTier: (collectionId: string) => boolean;
  getUserDepartments: (userId: string) => DepartmentData[];
  getEnterpriseUsers: (enterpriseId: string) => EnterpriseUser[];
  getEnterpriseDepartments: (enterpriseId: string) => DepartmentData[];
  getEnterpriseBookAccess: (enterpriseId: string) => BookAccessData[];
  getCollectionBooks: (collectionId: string) => string[];
  refreshCollections: () => Promise<void>;
  
  logAction: (action: string, targetType?: string, targetId?: string, targetTitle?: string, metadata?: Record<string, unknown>) => void;
  
  /** RBAC permission check — replaces isAdmin()/isComplianceOfficer() */
  can: (permission: Permission | string) => boolean;
  
  /** @deprecated Use can() instead */
  isAdmin: () => boolean;
  /** @deprecated Use can() instead */
  isComplianceOfficer: () => boolean;
  /** @deprecated Use can() instead */
  isDepartmentManager: () => boolean;
  hasRole: (role: EnterpriseRole) => boolean;
  
  loading: boolean;
}

const EnterpriseContext = createContext<EnterpriseContextType | undefined>(undefined);

export function EnterpriseProvider({ children }: { children: ReactNode }) {
  const [currentEnterprise, setCurrentEnterprise] = useState<EnterpriseData | null>(null);
  const [currentUser, setCurrentUser] = useState<EnterpriseUser | null>(null);
  const [enterprises, setEnterprises] = useState<EnterpriseData[]>([]);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [users, setUsers] = useState<EnterpriseUser[]>([]);
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [bookAccess, setBookAccess] = useState<BookAccessData[]>([]);
  const [isPlatformAdminState, setIsPlatformAdminState] = useState(false);
  const [loading, setLoading] = useState(true);

  const isEnterpriseMode = useMemo(() => currentEnterprise !== null, [currentEnterprise]);
  const currentTier = useMemo(() =>
    currentEnterprise ? getTierDefinition(currentEnterprise.licensingTier) ?? null : null,
    [currentEnterprise]
  );

  const seatUtilizationPercent = useMemo(() => {
    if (!currentEnterprise || currentEnterprise.licenseSeats === 0) return 0;
    return Math.round((currentEnterprise.usedSeats / currentEnterprise.licenseSeats) * 100);
  }, [currentEnterprise]);

  const isSeatLimitExceeded = useMemo(() => {
    if (!currentEnterprise || !currentTier) return false;
    return !isWithinSeatLimit(currentEnterprise.licensingTier, currentEnterprise.usedSeats);
  }, [currentEnterprise, currentTier]);

  // Load enterprise data from DB based on authenticated user
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setTimeout(() => {
          void loadEnterpriseData(session.user.id).then((enterpriseId) => {
            if (event === 'SIGNED_IN') {
              void supabase.from('usage_events').insert([{
                event_type: 'login',
                user_id: session.user.id,
                enterprise_id: enterpriseId || null,
                metadata: { method: 'auth_state_change' },
              }]);
            }
          });
        }, 0);
      } else {
        resetState();
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        void loadEnterpriseData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const resetState = () => {
    setCurrentEnterprise(null);
    setCurrentUser(null);
    setEnterprises([]);
    setDepartments([]);
    setUsers([]);
    setCollections([]);
    setBookAccess([]);
    setIsPlatformAdminState(false);
    setIsRittenhouseManagement(false);
  };

  const [isRittenhouseManagement, setIsRittenhouseManagement] = useState(false);

  const loadEnterpriseData = async (userId: string): Promise<string | null> => {
    setLoading(true);
    let resultEnterpriseId: string | null = null;
    try {
      // 0. Check platform role status (platform_admin or rittenhouse_management)
      const { data: platformRoles } = await supabase
        .from('platform_roles')
        .select('role')
        .eq('user_id', userId);
      
      const roleSet = new Set((platformRoles || []).map(r => r.role));
      setIsPlatformAdminState(roleSet.has('platform_admin'));
      setIsRittenhouseManagement(roleSet.has('rittenhouse_management'));

      // 1. Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!profile) {
        setLoading(false);
        return null;
      }

      const enterpriseId = profile.enterprise_id;
      resultEnterpriseId = enterpriseId || null;

      // Build current user
      const currentUserData: EnterpriseUser = {
        id: profile.id,
        email: profile.email,
        name: profile.full_name || profile.email.split('@')[0],
        enterpriseId: enterpriseId || '',
        departmentIds: [],
        role: (profile.role as EnterpriseRole) || 'staff',
        jobTitle: profile.job_title || undefined,
        isActive: profile.is_active,
      };

      // Load department memberships
      if (enterpriseId) {
        const { data: memberships } = await supabase
          .from('user_department_membership')
          .select('department_id')
          .eq('user_id', userId);
        currentUserData.departmentIds = (memberships || []).map(m => m.department_id);
      }

      setCurrentUser(currentUserData);

      if (!enterpriseId) {
        setLoading(false);
        return null;
      }

      // 2. Load enterprise
      const { data: enterprise } = await supabase
        .from('enterprises')
        .select('*')
        .eq('id', enterpriseId)
        .maybeSingle();

      if (enterprise) {
        const entData: EnterpriseData = {
          id: enterprise.id,
          name: enterprise.name,
          type: enterprise.type,
          domain: enterprise.domain || '',
          contactEmail: enterprise.contact_email || '',
          licenseSeats: enterprise.license_seats,
          usedSeats: enterprise.used_seats,
          licensingTier: ((enterprise as any).licensing_tier as LicensingTier) || 'basic',
          logoColor: (enterprise as any).logo_color || 'hsl(213 50% 35%)',
          createdAt: enterprise.created_at,
        };
        setCurrentEnterprise(entData);
        setEnterprises([entData]);
      }

      // 3. Load departments, users, collections, book_access in parallel
      const [deptsRes, usersRes, collectionsRes, bookAccessRes] = await Promise.all([
        supabase.from('departments').select('*').eq('enterprise_id', enterpriseId),
        supabase.from('profiles').select('*').eq('enterprise_id', enterpriseId),
        supabase.from('compliance_collections').select('*'),
        supabase.from('book_access').select('*').eq('enterprise_id', enterpriseId),
      ]);

      // Departments
      setDepartments((deptsRes.data || []).map(d => ({
        id: d.id,
        enterpriseId: d.enterprise_id,
        name: d.name,
        description: d.description || undefined,
      })));

      // Users with department memberships
      const userIds = (usersRes.data || []).map(u => u.id);
      let membershipMap = new Map<string, string[]>();
      if (userIds.length > 0) {
        const { data: allMemberships } = await supabase
          .from('user_department_membership')
          .select('user_id, department_id')
          .in('user_id', userIds);
        (allMemberships || []).forEach(m => {
          const arr = membershipMap.get(m.user_id) || [];
          arr.push(m.department_id);
          membershipMap.set(m.user_id, arr);
        });
      }

      setUsers((usersRes.data || []).map(u => ({
        id: u.id,
        email: u.email,
        name: u.full_name || u.email.split('@')[0],
        enterpriseId: u.enterprise_id || '',
        departmentIds: membershipMap.get(u.id) || [],
        role: (u.role as EnterpriseRole) || 'staff',
        jobTitle: u.job_title || undefined,
        isActive: u.is_active,
      })));

      // Collections with book IDs
      const collectionRows = collectionsRes.data || [];
      if (collectionRows.length > 0) {
        const collectionIds = collectionRows.map(c => c.id);
        const { data: collBookRows } = await supabase
          .from('collection_books')
          .select('collection_id, book_id')
          .in('collection_id', collectionIds);

        const bookIdsByCollection = new Map<string, string[]>();
        (collBookRows || []).forEach(cb => {
          const arr = bookIdsByCollection.get(cb.collection_id) || [];
          arr.push(cb.book_id);
          bookIdsByCollection.set(cb.collection_id, arr);
        });

        setCollections(collectionRows.map(c => ({
          id: c.id,
          name: c.name,
          description: c.description || '',
          category: c.category,
          icon: c.icon || 'BookOpen',
          bookIds: bookIdsByCollection.get(c.id) || [],
          isSystemBundle: c.is_system_bundle,
          enterpriseId: c.enterprise_id || undefined,
        })));
      }

      // Book access
      setBookAccess((bookAccessRes.data || []).map(ba => ({
        id: ba.id,
        enterpriseId: ba.enterprise_id,
        bookId: ba.book_id,
        accessLevel: ba.access_level,
        grantedAt: ba.granted_at,
        expiresAt: ba.expires_at || undefined,
      })));

    } catch (err) {
      console.error('Error loading enterprise data:', err);
      return null;
    } finally {
      setLoading(false);
    }
    return resultEnterpriseId;
  };


  const canAccessCollectionByTier = useCallback((_collectionId: string) => {
    if (!currentEnterprise || !currentTier) return false;
    // 'all' means pro/enterprise can access everything
    if (currentTier.collectionsAccess === 'all') return true;
    // Basic tier: limit to first N collections by index position
    // Since DB collections don't match mock IDs, use tier's maxCollections as count limit
    const collIndex = collections.findIndex(c => c.id === _collectionId);
    return collIndex >= 0 && collIndex < (currentTier.maxCollections === -1 ? Infinity : currentTier.maxCollections);
  }, [currentEnterprise, currentTier, collections]);

  // Legacy methods kept for compatibility (no-ops now, auth happens via Supabase)
  const loginAsEnterpriseUser = useCallback((_userId: string) => {}, []);
  const loginAsEnterprise = useCallback((_enterpriseId: string, _role?: EnterpriseRole) => {}, []);

  const logoutEnterprise = useCallback(async () => {
    resetState();
    setLoading(false);
    // Sign out via Supabase (clears session from storage automatically)
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out error, clearing locally');
      // Fallback: clear all supabase auth keys from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
          localStorage.removeItem(key);
        }
      });
    }
    // Navigate to auth page
    window.location.href = '/auth';
  }, []);

  const hasBookAccess = useCallback((bookId: string) => {
    if (!currentEnterprise) return false;
    return bookAccess.some(ba => ba.enterpriseId === currentEnterprise.id && ba.bookId === bookId && ba.accessLevel === 'full');
  }, [currentEnterprise, bookAccess]);

  const getUserDepartments = useCallback((userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return [];
    return departments.filter(d => user.departmentIds.includes(d.id));
  }, [users, departments]);

  const getEnterpriseUsers = useCallback((enterpriseId: string) => {
    return users.filter(u => u.enterpriseId === enterpriseId);
  }, [users]);

  const getEnterpriseDepartments = useCallback((enterpriseId: string) => {
    return departments.filter(d => d.enterpriseId === enterpriseId);
  }, [departments]);

  const getEnterpriseBookAccess = useCallback((enterpriseId: string) => {
    return bookAccess.filter(ba => ba.enterpriseId === enterpriseId);
  }, [bookAccess]);

  const getCollectionBooks = useCallback((collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    return collection?.bookIds || [];
  }, [collections]);

  const refreshCollections = useCallback(async () => {
    const { data: collectionRows } = await supabase.from('compliance_collections').select('*');
    if (collectionRows && collectionRows.length > 0) {
      const collectionIds = collectionRows.map(c => c.id);
      const { data: collBookRows } = await supabase
        .from('collection_books')
        .select('collection_id, book_id')
        .in('collection_id', collectionIds);

      const bookIdsByCollection = new Map<string, string[]>();
      (collBookRows || []).forEach(cb => {
        const arr = bookIdsByCollection.get(cb.collection_id) || [];
        arr.push(cb.book_id);
        bookIdsByCollection.set(cb.collection_id, arr);
      });

      setCollections(collectionRows.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description || '',
        category: c.category,
        icon: c.icon || 'BookOpen',
        bookIds: bookIdsByCollection.get(c.id) || [],
        isSystemBundle: c.is_system_bundle,
        enterpriseId: c.enterprise_id || undefined,
      })));
    }
  }, []);

  // Write audit logs to DB
  const logAction = useCallback(async (
    action: string,
    targetType?: string,
    targetId?: string,
    targetTitle?: string,
    metadata?: Record<string, unknown>
  ) => {
    if (!currentUser) return;
    try {
      await supabase.from('audit_logs').insert([{
        user_id: currentUser.id,
        enterprise_id: currentEnterprise?.id || null,
        action,
        target_type: targetType || null,
        target_id: targetId || null,
        target_title: targetTitle || null,
        metadata: (metadata as any) || null,
      }]);
    } catch (err) {
      console.error('Failed to log audit action:', err);
    }
  }, [currentUser, currentEnterprise]);

  // RBAC permission check
  const can = useCallback((permission: Permission | string): boolean => {
    if (!currentUser && !isPlatformAdminState && !isRittenhouseManagement) return false;
    
    // Platform admin = super_admin role
    if (isPlatformAdminState) {
      return hasPermission('super_admin', permission);
    }
    
    // Rittenhouse management = read-only reporting role
    if (isRittenhouseManagement) {
      return hasPermission('rittenhouse_management', permission);
    }
    
    const role = currentUser?.role as RBACRole | undefined;
    if (!role) return false;
    return hasPermission(role, permission);
  }, [currentUser, isPlatformAdminState, isRittenhouseManagement]);

  // Legacy wrappers — delegate to can()
  const isAdmin = useCallback(() => can('users.update') && can('roles.assign'), [can]);
  const isComplianceOfficer = useCallback(() => can('reports.view') && can('audit.view'), [can]);
  const isDepartmentManager = useCallback(() => can('analytics.department'), [can]);
  const hasRole = useCallback((role: EnterpriseRole) => currentUser?.role === role, [currentUser]);

  const value: EnterpriseContextType = {
    currentEnterprise,
    currentUser,
    isEnterpriseMode,
    isPlatformAdmin: isPlatformAdminState,
    enterprises,
    departments,
    users,
    collections,
    bookAccess,
    auditLogs: [],
    currentTier,
    isSeatLimitExceeded,
    seatUtilizationPercent,
    loginAsEnterpriseUser,
    loginAsEnterprise,
    logoutEnterprise,
    hasBookAccess,
    canAccessCollectionByTier,
    getUserDepartments,
    getEnterpriseUsers,
    getEnterpriseDepartments,
    getEnterpriseBookAccess,
    getCollectionBooks,
    refreshCollections,
    logAction,
    can,
    isAdmin,
    isComplianceOfficer,
    isDepartmentManager,
    hasRole,
    loading,
  };

  return (
    <EnterpriseContext.Provider value={value}>
      {children}
    </EnterpriseContext.Provider>
  );
}

export function useEnterprise() {
  const context = useContext(EnterpriseContext);
  if (!context) {
    throw new Error('useEnterprise must be used within an EnterpriseProvider');
  }
  return context;
}
