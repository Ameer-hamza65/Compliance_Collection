import { motion } from 'framer-motion';
import { SlideLayout } from '../SlideLayout';
import { ShieldCheck } from 'lucide-react';

const roles = [
  { role: 'Platform Admin', scope: 'Full system access, manage all enterprises', badge: 'hsl(350,65%,55%)' },
  { role: 'Enterprise Admin', scope: 'Manage users, seats, collections within org', badge: 'hsl(38,95%,55%)' },
  { role: 'Compliance Officer', scope: 'Audit logs, COUNTER reports, compliance bundles', badge: 'hsl(174,72%,46%)' },
  { role: 'Department Manager', scope: 'Manage department members and content access', badge: 'hsl(217,91%,76%)' },
  { role: 'Staff', scope: 'Read-only content access within licensed scope', badge: 'hsl(215,20%,55%)' },
];

const authFeatures = [
  { title: 'Email + Password', desc: 'Standard credential-based authentication with email verification' },
  { title: 'SSO / SAML Ready', desc: 'Phase 2 — plug in any hospital IdP (Okta, Azure AD, ADFS)' },
  { title: 'Session Management', desc: 'JWT-based sessions with automatic refresh and secure storage' },
  { title: 'Protected Routes', desc: 'Route guards check auth state and role before rendering pages' },
];

export function AuthSlide() {
  return (
    <SlideLayout className="bg-[hsl(222,47%,6%)] text-[hsl(210,40%,92%)]">
      <div className="relative z-10 flex flex-col h-full px-24 py-14">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-5 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[hsl(142,60%,50%/0.12)] flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-[hsl(142,60%,50%)]" />
          </div>
          <div>
            <h2 className="text-[56px] font-black tracking-tight">Authentication & Roles</h2>
            <p className="text-[20px] text-[hsl(215,20%,55%)]">Five-tier RBAC with enterprise isolation</p>
          </div>
        </motion.div>

        <div className="flex-1 flex gap-10">
          {/* Roles */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="text-[13px] text-[hsl(215,20%,45%)] font-bold tracking-[4px] uppercase mb-1">Role Hierarchy</div>
            {roles.map((r, i) => (
              <motion.div
                key={r.role}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="flex-1 rounded-xl border border-[hsl(220,20%,14%)] bg-[hsl(222,40%,9%)] px-6 flex items-center gap-5"
              >
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: r.badge }} />
                <div className="flex-1">
                  <div className="text-[18px] font-bold">{r.role}</div>
                  <div className="text-[14px] text-[hsl(215,20%,50%)]">{r.scope}</div>
                </div>
                <div className="text-[28px] font-black text-[hsl(220,20%,15%)]">{i + 1}</div>
              </motion.div>
            ))}
          </div>

          {/* Auth features */}
          <div className="w-[480px] flex flex-col gap-4">
            <div className="text-[13px] text-[hsl(215,20%,45%)] font-bold tracking-[4px] uppercase mb-1">Auth Capabilities</div>
            {authFeatures.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex-1 rounded-xl border border-[hsl(220,20%,14%)] bg-[hsl(222,40%,9%)] p-6 flex flex-col justify-center"
              >
                <div className="text-[18px] font-bold mb-1">{f.title}</div>
                <div className="text-[14px] text-[hsl(215,20%,50%)]">{f.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}
