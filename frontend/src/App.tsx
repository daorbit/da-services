import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "@/features/auth/LoginPage";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";
import { Layout } from "@/shared/components/Layout";
import { AdminUsersPage } from "@/features/admin-users/AdminUsersPage";
import { AppsPage } from "@/features/apps/AppsPage";
import { CustomersPage } from "@/features/customers/CustomersPage";
import { WorkspacesPage } from "@/features/workspaces/WorkspacesPage";
import { WorkspaceDetailPage } from "@/features/workspaces/WorkspaceDetailPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/customers" replace />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/workspaces" element={<WorkspacesPage />} />
            <Route path="/workspaces/:app/:id" element={<WorkspaceDetailPage />} />
            <Route path="/apps" element={<AppsPage />} />
            <Route path="/admin-users" element={<AdminUsersPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
