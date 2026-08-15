import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "@/features/auth/LoginPage";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";
import { Layout } from "@/shared/components/Layout";
import { AdminUsersPage } from "@/features/admin-users/AdminUsersPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/admin-users" replace />} />
            <Route path="/admin-users" element={<AdminUsersPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
