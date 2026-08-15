import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "@/features/auth/LoginPage";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";
import { Layout } from "@/shared/components/Layout";
import { AdminUsersPage } from "@/features/admin-users/AdminUsersPage";
import { AppsPage } from "@/features/apps/AppsPage";
import { AppUsersPage } from "@/features/app-data/AppUsersPage";
import { AppWorkspacesPage } from "@/features/app-data/AppWorkspacesPage";
import { AppWorkspaceDetailPage } from "@/features/app-data/AppWorkspaceDetailPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/apps" replace />} />
            <Route path="/apps" element={<AppsPage />} />
            <Route path="/apps/:appSlug/users" element={<AppUsersPage />} />
            <Route path="/apps/:appSlug/workspaces" element={<AppWorkspacesPage />} />
            <Route path="/apps/:appSlug/workspaces/:id" element={<AppWorkspaceDetailPage />} />
            <Route path="/admin-users" element={<AdminUsersPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
