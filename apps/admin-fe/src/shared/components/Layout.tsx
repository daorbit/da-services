import { AppShell, NavLink, Group, Text, Button } from "@mantine/core";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { logout } from "@/features/auth/authSlice";

const NAV = [{ label: "Admin Users", path: "/admin-users" }];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  return (
    <AppShell navbar={{ width: 240, breakpoint: "sm" }} header={{ height: 56 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Text fw={700}>DA Services Admin</Text>
          <Group>
            <Text size="sm" c="dimmed">{user?.email}</Text>
            <Button
              size="xs"
              variant="light"
              onClick={() => {
                dispatch(logout());
                navigate("/login");
              }}
            >
              Sign out
            </Button>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        {NAV.map((item) => (
          <NavLink
            key={item.path}
            component={Link}
            to={item.path}
            label={item.label}
            active={location.pathname === item.path}
          />
        ))}
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
