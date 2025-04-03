
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import UserLogin from "./pages/auth/UserLogin";
import AdminLogin from "./pages/auth/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import QueueDetail from "./pages/admin/QueueDetail";
import UserDashboard from "./pages/user/UserDashboard";
import ProtectedRoute from "./utils/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/user/login" element={<UserLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute requiredUserType="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/queue/:queueId" 
            element={
              <ProtectedRoute requiredUserType="admin">
                <QueueDetail />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/user/dashboard" 
            element={
              <ProtectedRoute requiredUserType="user">
                <UserDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
