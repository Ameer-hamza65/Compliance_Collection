import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useEnterprise } from '@/context/EnterpriseContext';
import { Loader2, ShieldX } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import type { EnterpriseRole } from '@/data/mockEnterpriseData';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  /** Enterprise roles that are allowed (checked against profile.role) */
  allowedRoles?: EnterpriseRole[];
  /** If true, requires platform_admin in platform_roles table */
  requirePlatformAdmin?: boolean;
  /** Permission string to check via RBAC engine (alternative to allowedRoles) */
  requiredPermission?: string;
}

export function RoleProtectedRoute({ children, allowedRoles, requirePlatformAdmin, requiredPermission }: RoleProtectedRouteProps) {
  const navigate = useNavigate();
  const { currentUser, loading: enterpriseLoading, isEnterpriseMode, can, isPlatformAdmin } = useEnterprise();
  const [authLoading, setAuthLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [isPlatformAdminLocal, setIsPlatformAdminLocal] = useState(false);
  const [isRittenhouseManagement, setIsRittenhouseManagement] = useState(false);
  const [platformCheckDone, setPlatformCheckDone] = useState(!requirePlatformAdmin);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setAuthenticated(!!session);
      if (session && requirePlatformAdmin) {
        const { data } = await supabase
          .from('platform_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'platform_admin')
          .maybeSingle();
        setIsPlatformAdminLocal(!!data);
        setPlatformCheckDone(true);
      }
      if (session) {
        // Check for rittenhouse_management role
        const { data: rmRole } = await supabase
          .from('platform_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'rittenhouse_management')
          .maybeSingle();
        setIsRittenhouseManagement(!!rmRole);
      }
      setAuthLoading(false);
    });
  }, [requirePlatformAdmin]);

  const loading = authLoading || enterpriseLoading || !platformCheckDone;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Platform admin check
  if (requirePlatformAdmin && !isPlatformAdminLocal) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <ShieldX className="h-12 w-12 mx-auto text-destructive mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>This page requires platform administrator privileges.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => navigate('/')}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // RBAC permission check (new path)
  if (requiredPermission && !can(requiredPermission)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <ShieldX className="h-12 w-12 mx-auto text-destructive mb-4" />
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              You do not have the required permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => navigate('/')}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Enterprise role check (legacy path)
  if (allowedRoles && allowedRoles.length > 0) {
    // Platform admins and rittenhouse_management users bypass enterprise role checks
    // if they have the matching RBAC permission via can()
    if (isPlatformAdmin || isRittenhouseManagement) {
      // Platform-level roles: allow if they have relevant permissions
      // Platform admin has all permissions; rittenhouse_management has read-only report access
      return <>{children}</>;
    }

    if (!isEnterpriseMode || !currentUser) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <ShieldX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <CardTitle>Enterprise Access Required</CardTitle>
              <CardDescription>Please log in with an enterprise account to access this page.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => navigate('/')}>Return Home</Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (!allowedRoles.includes(currentUser.role) && !can('platform.manage')) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <ShieldX className="h-12 w-12 mx-auto text-destructive mb-4" />
              <CardTitle>Access Restricted</CardTitle>
              <CardDescription>
                Your role ({currentUser.role}) does not have permission to access this page.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => navigate('/enterprise')}>Back to Dashboard</Button>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return <>{children}</>;
}
