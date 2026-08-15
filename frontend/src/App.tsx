import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "@/features/auth/LoginPage";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";
import { Layout } from "@/shared/components/Layout";
import { AdminUsersPage } from "@/features/admin-users/AdminUsersPage";
import { QuantalogUsersPage } from "@/features/quantalog/QuantalogUsersPage";
import { QuantalogWorkspacesPage } from "@/features/quantalog/QuantalogWorkspacesPage";
import { QuantalogWorkspaceDetailPage } from "@/features/quantalog/QuantalogWorkspaceDetailPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/quantalog/workspaces" replace />} />
            <Route path="/quantalog/users" element={<QuantalogUsersPage />} />
            <Route path="/quantalog/workspaces" element={<QuantalogWorkspacesPage />} />
            <Route path="/quantalog/workspaces/:id" element={<QuantalogWorkspaceDetailPage />} />
            <Route path="/admin-users" element={<AdminUsersPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
