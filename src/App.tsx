import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "@/context/UserContext";
import { BookProvider } from "@/context/BookContext";
import { EnterpriseProvider } from "@/context/EnterpriseContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Index from "./pages/Index";
import Library from "./pages/Library";
import Reader from "./pages/Reader";
import AdminUpload from "./pages/AdminUpload";
import BookDetail from "./pages/BookDetail";
import EnterpriseDashboard from "./pages/EnterpriseDashboard";
import ComplianceCollections from "./pages/ComplianceCollections";
import CollectionDetail from "./pages/CollectionDetail";
import AuditLogs from "./pages/AuditLogs";
import CounterReporting from "./pages/CounterReporting";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Accessibility from "./pages/Accessibility";
import RepositoryOverview from "./pages/RepositoryOverview";
import InstitutionalPricing from "./pages/InstitutionalPricing";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";

import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <BookProvider>
        <EnterpriseProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1" id="main-content">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/library" element={<RoleProtectedRoute allowedRoles={['admin', 'compliance_officer', 'department_manager']}><Library /></RoleProtectedRoute>} />
                    <Route path="/reader" element={<Reader />} />
                    <Route path="/book/:id" element={<BookDetail />} />
                    <Route path="/admin/upload" element={<RoleProtectedRoute requirePlatformAdmin><AdminUpload /></RoleProtectedRoute>} />
                    <Route path="/admin/dashboard" element={<RoleProtectedRoute requirePlatformAdmin><SuperAdminDashboard /></RoleProtectedRoute>} />
                    <Route path="/admin/repository" element={<RoleProtectedRoute requirePlatformAdmin><RepositoryOverview /></RoleProtectedRoute>} />

                    <Route path="/auth" element={<Auth />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/enterprise" element={<ProtectedRoute><EnterpriseDashboard /></ProtectedRoute>} />
                    <Route path="/collections" element={<ProtectedRoute><ComplianceCollections /></ProtectedRoute>} />
                    <Route path="/collections/:collectionId" element={<ProtectedRoute><CollectionDetail /></ProtectedRoute>} />
                    <Route path="/audit-logs" element={<RoleProtectedRoute allowedRoles={['admin', 'compliance_officer']}><AuditLogs /></RoleProtectedRoute>} />
                    <Route path="/counter-reports" element={<RoleProtectedRoute allowedRoles={['admin', 'compliance_officer']}><CounterReporting /></RoleProtectedRoute>} />

                    <Route path="/accessibility" element={<Accessibility />} />
                    <Route path="/subscribe" element={<InstitutionalPricing />} />
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </EnterpriseProvider>
      </BookProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
