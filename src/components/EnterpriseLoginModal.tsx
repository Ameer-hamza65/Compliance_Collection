import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEnterprise } from '@/context/EnterpriseContext';
import { Building2, GraduationCap, Landmark, Users, Shield, ClipboardList, User } from 'lucide-react';
import { EnterpriseRole } from '@/data/mockEnterpriseData';

interface EnterpriseLoginModalProps {
  open: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const enterpriseIcons: Record<string, React.ReactNode> = {
  hospital: <Building2 className="h-8 w-8" />,
  medical_school: <GraduationCap className="h-8 w-8" />,
  government: <Landmark className="h-8 w-8" />
};

const roleIcons: Record<EnterpriseRole, React.ReactNode> = {
  admin: <Shield className="h-5 w-5" />,
  compliance_officer: <ClipboardList className="h-5 w-5" />,
  department_manager: <Users className="h-5 w-5" />,
  staff: <User className="h-5 w-5" />
};

const roleDescriptions: Record<EnterpriseRole, string> = {
  admin: 'Full access to all features, settings, and reports',
  compliance_officer: 'Access to compliance dashboards, audit logs, and reports',
  department_manager: 'Manage department users and view team analytics',
  staff: 'Access to assigned content and collections'
};

export function EnterpriseLoginModal({ open, onClose, onLoginSuccess }: EnterpriseLoginModalProps) {
  const { enterprises, loginAsEnterprise, getEnterpriseUsers } = useEnterprise();
  const [selectedEnterprise, setSelectedEnterprise] = useState<string | null>(null);
  const [step, setStep] = useState<'enterprise' | 'role'>('enterprise');

  const handleEnterpriseSelect = (enterpriseId: string) => {
    setSelectedEnterprise(enterpriseId);
    setStep('role');
  };

  const handleRoleSelect = (role: EnterpriseRole) => {
    if (selectedEnterprise) {
      loginAsEnterprise(selectedEnterprise, role);
      onLoginSuccess();
      onClose();
      // Reset state
      setSelectedEnterprise(null);
      setStep('enterprise');
    }
  };

  const handleBack = () => {
    setStep('enterprise');
    setSelectedEnterprise(null);
  };

  const selectedEnterpriseData = enterprises.find(e => e.id === selectedEnterprise);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === 'enterprise' ? 'Enterprise Demo Login' : 'Select Your Role'}
          </DialogTitle>
          <DialogDescription>
            {step === 'enterprise' 
              ? 'Choose an enterprise to explore the institutional features'
              : `Login to ${selectedEnterpriseData?.name} as:`
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'enterprise' ? (
          <div className="grid gap-3 py-4">
            {enterprises.map((enterprise) => (
              <Card 
                key={enterprise.id}
                className="cursor-pointer hover:border-accent transition-colors"
                onClick={() => handleEnterpriseSelect(enterprise.id)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-center gap-4">
                    <div 
                      className="p-3 rounded-lg text-white"
                      style={{ backgroundColor: enterprise.logoColor }}
                    >
                      {enterpriseIcons[enterprise.type]}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{enterprise.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {enterprise.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {enterprise.usedSeats}/{enterprise.licenseSeats} seats
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <Button 
              variant="ghost" 
              onClick={handleBack}
              className="mb-2"
            >
              ← Back to enterprises
            </Button>
            
            <div className="grid gap-3">
              {(['admin', 'compliance_officer', 'department_manager', 'staff'] as EnterpriseRole[]).map((role) => (
                <Card 
                  key={role}
                  className="cursor-pointer hover:border-accent transition-colors"
                  onClick={() => handleRoleSelect(role)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-accent/10 text-accent">
                        {roleIcons[role]}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">
                          {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {roleDescriptions[role]}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
