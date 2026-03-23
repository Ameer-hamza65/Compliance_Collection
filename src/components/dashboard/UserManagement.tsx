import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Users, Shield, Mail, Building2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useEnterprise, EnterpriseUser, DepartmentData } from '@/context/EnterpriseContext';
import type { EnterpriseRole } from '@/data/mockEnterpriseData';

const ROLE_OPTIONS: { value: EnterpriseRole; label: string; description: string }[] = [
  { value: 'staff', label: 'Staff', description: 'Read-only access to licensed content' },
  { value: 'department_manager', label: 'Dept. Manager', description: 'View department analytics' },
  { value: 'compliance_officer', label: 'Compliance Officer', description: 'Access reports & compliance tools' },
  { value: 'admin', label: 'Admin', description: 'Full enterprise management' },
];

const roleBadgeVariant = (role: string) => {
  switch (role) {
    case 'admin': return 'default';
    case 'compliance_officer': return 'secondary';
    case 'department_manager': return 'outline';
    default: return 'outline';
  }
};

export function UserManagement() {
  const { currentEnterprise, users, departments, currentUser, getEnterpriseUsers } = useEnterprise();
  const [updating, setUpdating] = useState<string | null>(null);

  if (!currentEnterprise) return null;

  const enterpriseUsers = getEnterpriseUsers(currentEnterprise.id);

  const handleRoleChange = async (userId: string, newRole: EnterpriseRole) => {
    if (userId === currentUser?.id) {
      toast({ title: 'Cannot change your own role', variant: 'destructive' });
      return;
    }
    setUpdating(userId);
    try {
      const { error } = await supabase.rpc('assign_role', {
        p_user_id: userId,
        p_new_role: newRole,
      });
      if (error) throw error;
      toast({ title: 'Role updated', description: `User role changed to ${newRole.replace('_', ' ')}` });
      window.location.reload();
    } catch (err: any) {
      toast({ title: 'Failed to update role', description: err.message, variant: 'destructive' });
    } finally {
      setUpdating(null);
    }
  };

  const handleToggleActive = async (userId: string, currentlyActive: boolean) => {
    if (userId === currentUser?.id) {
      toast({ title: 'Cannot deactivate yourself', variant: 'destructive' });
      return;
    }
    setUpdating(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentlyActive })
        .eq('id', userId);
      if (error) throw error;
      toast({ title: currentlyActive ? 'User deactivated' : 'User activated' });
      window.location.reload();
    } catch (err: any) {
      toast({ title: 'Failed to update', description: err.message, variant: 'destructive' });
    } finally {
      setUpdating(null);
    }
  };

  const getUserDeptNames = (user: EnterpriseUser): string => {
    return user.departmentIds
      .map(id => departments.find(d => d.id === id)?.name)
      .filter(Boolean)
      .join(', ') || '—';
  };

  return (
    <div className="space-y-6">
      {/* Domain Auto-Assignment Info */}
      <Card className="border-accent/20 bg-accent/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-accent mt-0.5" />
            <div>
              <p className="font-medium text-sm">Domain-Based Auto-Assignment</p>
              <p className="text-sm text-muted-foreground mt-1">
                New users who sign up with an <strong>@{currentEnterprise.domain}</strong> email
                will be automatically added to your enterprise as <Badge variant="outline" className="mx-1">Staff</Badge>.
                You can then promote them to other roles below.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Enterprise Users ({enterpriseUsers.length})
              </CardTitle>
              <CardDescription>Manage roles and access for your organization's members</CardDescription>
            </div>
            <Badge variant="secondary">
              {currentEnterprise.usedSeats}/{currentEnterprise.licenseSeats} seats
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Departments</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enterpriseUsers.map((user) => (
                <TableRow key={user.id} className={!user.isActive ? 'opacity-50' : ''}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      {user.jobTitle && <p className="text-xs text-muted-foreground">{user.jobTitle}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.id === currentUser?.id ? (
                      <Badge variant={roleBadgeVariant(user.role)}>
                        {user.role.replace('_', ' ')}
                        <span className="ml-1 text-[10px]">(you)</span>
                      </Badge>
                    ) : (
                      <Select
                        value={user.role}
                        onValueChange={(v) => handleRoleChange(user.id, v as EnterpriseRole)}
                        disabled={updating === user.id}
                      >
                        <SelectTrigger className="w-[160px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <div>
                                <p className="font-medium">{opt.label}</p>
                                <p className="text-xs text-muted-foreground">{opt.description}</p>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground">{getUserDeptNames(user)}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'destructive'} className="text-xs">
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch
                      checked={user.isActive}
                      onCheckedChange={() => handleToggleActive(user.id, user.isActive)}
                      disabled={user.id === currentUser?.id || updating === user.id}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {enterpriseUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No users in this enterprise yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Role Permissions Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROLE_OPTIONS.map(role => (
              <div key={role.value} className="border rounded-lg p-4 space-y-2">
                <Badge variant={roleBadgeVariant(role.value)}>{role.label}</Badge>
                <p className="text-xs text-muted-foreground">{role.description}</p>
                <ul className="text-xs space-y-1">
                  {role.value === 'staff' && (
                    <>
                      <li>✓ Browse & read books</li>
                      <li>✓ Use AI assistant</li>
                      <li>✗ View reports</li>
                    </>
                  )}
                  {role.value === 'department_manager' && (
                    <>
                      <li>✓ All Staff permissions</li>
                      <li>✓ View department analytics</li>
                      <li>✗ Manage users</li>
                    </>
                  )}
                  {role.value === 'compliance_officer' && (
                    <>
                      <li>✓ All Manager permissions</li>
                      <li>✓ COUNTER reports</li>
                      <li>✓ Compliance scoring</li>
                    </>
                  )}
                  {role.value === 'admin' && (
                    <>
                      <li>✓ All permissions</li>
                      <li>✓ Manage users & roles</li>
                      <li>✓ Enterprise settings</li>
                    </>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
