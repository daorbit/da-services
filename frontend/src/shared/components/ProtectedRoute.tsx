import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Center, Loader } from "@mantine/core";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchMe } from "@/features/auth/authSlice";

export function ProtectedRoute() {
  const dispatch = useAppDispatch();
  const { user, status } = useAppSelector((s) => s.auth);
  const hasToken = Boolean(localStorage.getItem("token"));

  useEffect(() => {
    if (hasToken && status === "idle") dispatch(fetchMe());
  }, [hasToken, status, dispatch]);

  if (!hasToken) return <Navigate to="/login" replace />;
  if (status === "loading" || status === "idle") {
    return (
      <Center mih="100vh">
        <Loader />
      </Center>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}
