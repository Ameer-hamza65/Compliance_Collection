import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Book, Search, LogOut, Building2, Shield, FileText, FolderOpen, LogIn, Upload, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useEnterprise } from '@/context/EnterpriseContext';
import { useUser } from '@/context/UserContext';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    currentEnterprise, 
    currentUser, 
    isEnterpriseMode, 
    isPlatformAdmin,
    logoutEnterprise,
    can,
  } = useEnterprise();
  const { session } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logoutEnterprise();
  };

  const isStaff = isEnterpriseMode && currentUser?.role === 'staff';

  const mainNavItems = [
    { path: '/', label: 'Search', icon: Search },
    ...(!isStaff ? [{ path: '/library', label: 'Library', icon: Book }] : []),
    { path: '/collections', label: 'Collections', icon: FolderOpen },
  ];

  const enterpriseNavItems = [
    { path: '/enterprise', label: 'Dashboard', icon: Building2 },
  ];

  const NavLink = ({ path, label, icon: Icon, onClick }: { path: string; label: string; icon: any; onClick?: () => void }) => (
    <Link key={path} to={path} onClick={onClick}>
      <Button 
        variant={isActive(path) ? 'secondary' : 'ghost'} 
        size="sm"
        className={`font-medium transition-all duration-300 w-full justify-start ${isActive(path) ? 'bg-accent/10 text-accent border border-accent/20' : 'hover:text-accent'}`}
      >
        <Icon className="h-4 w-4 mr-1.5" />
        {label}
      </Button>
    </Link>
  );

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent focus:text-accent-foreground focus:rounded-md focus:outline-none">
        Skip to main content
      </a>
      <motion.header 
        role="banner"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
      >
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4 lg:gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 3 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="flex h-8 w-8 lg:h-9 lg:w-9 items-center justify-center rounded-lg bg-accent shadow-glow"
              >
                <Shield className="h-4 w-4 lg:h-5 lg:w-5 text-accent-foreground" />
              </motion.div>
              <span className="text-lg lg:text-xl font-bold tracking-tight text-foreground">
                MedLib<span className="text-accent text-glow-subtle">Pro</span>
              </span>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
              {mainNavItems.map(item => (
                <NavLink key={item.path} {...item} />
              ))}
              {isEnterpriseMode && (
                <>
                  {enterpriseNavItems.map(item => (
                    <NavLink key={item.path} {...item} />
                  ))}
                  {can('audit.view') && (
                    <NavLink path="/audit-logs" label="Audit Logs" icon={FileText} />
                  )}
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
          <div className="hidden sm:flex items-center gap-2">
              {session ? (
                <>
                  {isPlatformAdmin && (
                    <>
                      <Link to="/admin/dashboard">
                        <Button variant="ghost" size="sm" className="gap-1.5 hover:text-accent">
                          <Shield className="h-4 w-4" />
                          <span className="hidden md:inline">Admin</span>
                        </Button>
                      </Link>
                      <Link to="/admin/upload">
                        <Button variant="ghost" size="sm" className="gap-1.5 hover:text-accent">
                          <Upload className="h-4 w-4" />
                          <span className="hidden md:inline">Upload</span>
                        </Button>
                      </Link>
                    </>
                  )}
                  {!isEnterpriseMode && (
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 text-muted-foreground hover:text-destructive text-xs">
                      <LogOut className="h-3.5 w-3.5" />
                      <span className="hidden md:inline">Sign Out</span>
                    </Button>
                  )}
                </>
              ) : (
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="gap-1.5 border-accent/30 text-accent hover:bg-accent/10 hover:border-accent/50 transition-all duration-300">
                    <LogIn className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">Sign In</span>
                  </Button>
                </Link>
              )}
            </div>

            {isEnterpriseMode && currentUser && currentEnterprise && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 hover:bg-accent/5">
                    <div 
                      className="flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-bold ring-2 ring-accent/30"
                      style={{ backgroundColor: currentEnterprise.logoColor }}
                    >
                      {currentEnterprise.name.charAt(0)}
                    </div>
                    <span className="hidden md:inline font-medium">{currentUser.name}</span>
                    <Badge variant="secondary" className="hidden lg:inline-flex text-xs bg-accent/10 text-accent border-accent/20">
                      {currentUser.role.replace('_', ' ')}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 glass-card border-accent/10">
                  <DropdownMenuLabel>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-accent" />
                      <span>{currentEnterprise.name}</span>
                    </div>
                  </DropdownMenuLabel>
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem asChild>
                    <Link to="/enterprise" className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/collections" className="cursor-pointer">
                      <FolderOpen className="mr-2 h-4 w-4" />Compliance Collections
                    </Link>
                  </DropdownMenuItem>
                  {can('audit.view') && (
                    <DropdownMenuItem asChild>
                      <Link to="/audit-logs" className="cursor-pointer">
                        <FileText className="mr-2 h-4 w-4" />Audit Logs
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden p-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-background/95 backdrop-blur-xl p-6">
                <div className="flex items-center gap-2 mb-8">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                    <Shield className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <span className="text-lg font-bold text-foreground">MedLib<span className="text-accent">Pro</span></span>
                </div>
                <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
                  {mainNavItems.map(item => (
                    <NavLink key={item.path} {...item} onClick={() => setMobileOpen(false)} />
                  ))}
                  {isEnterpriseMode && (
                    <>
                      <div className="my-2 border-t border-border/50" />
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1">Enterprise</p>
                      {enterpriseNavItems.map(item => (
                        <NavLink key={item.path} {...item} onClick={() => setMobileOpen(false)} />
                      ))}
                      {can('audit.view') && (
                        <NavLink path="/audit-logs" label="Audit Logs" icon={FileText} onClick={() => setMobileOpen(false)} />
                      )}
                    </>
                  )}
                  <div className="my-2 border-t border-border/50" />
                  {session ? (
                    <>
                      {isPlatformAdmin && (
                        <Link to="/admin/upload" onClick={() => setMobileOpen(false)}>
                          <Button variant="ghost" size="sm" className="w-full justify-start gap-1.5"><Upload className="h-4 w-4" /> Upload</Button>
                        </Link>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => { handleLogout(); setMobileOpen(false); }} className="w-full justify-start gap-1.5 text-destructive">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </Button>
                    </>
                  ) : (
                    <Link to="/auth" onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start gap-1.5"><LogIn className="h-4 w-4" /> Sign In</Button>
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.header>
    </>
  );
}
