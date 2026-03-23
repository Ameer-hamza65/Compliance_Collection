import { Link } from 'react-router-dom';
import { Shield, FileText, Book, Building2, Database } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/30 py-8 mt-auto" role="contentinfo">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent">
                <Shield className="h-4 w-4 text-accent-foreground" />
              </div>
              <span className="font-bold text-foreground">
                MedLib<span className="text-accent">Pro</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered compliance collections for hospitals and surgery centers. Institutional SaaS licensing with enterprise-grade security.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wider">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/library" className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center gap-1.5">
                  <Book className="h-3.5 w-3.5" /> Title Catalog
                </Link>
              </li>
              <li>
                <Link to="/collections" className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" /> Compliance Collections
                </Link>
              </li>
              <li>
              <Link to="/counter-reports" className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> COUNTER 5.1 Reports
                </Link>
              </li>
              <li>
                <Link to="/admin/repository" className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5" /> Repository Architecture
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wider">Compliance</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/accessibility" className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" /> VPAT / Accessibility
                </Link>
              </li>
              <li>
                <Link to="/counter-reports" className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> COUNTER 5.1 Reports
                </Link>
              </li>
              <li>
                <Link to="/audit-logs" className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> Audit Logs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-border/30 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Rittenhouse Book Distributors. All rights reserved. WCAG 2.1 AA Compliant.
          </p>
        </div>
      </div>
    </footer>
  );
}
