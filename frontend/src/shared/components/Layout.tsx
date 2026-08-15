import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppShell as MantineShell, Group, Text, UnstyledButton, Menu, Avatar,
} from "@mantine/core";
import { LogOut, ChevronDown, Users, FolderKanban, Layers, ShieldCheck } from "lucide-react";
import { Wordmark } from "@/shared/components/Brand";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { logout } from "@/features/auth/authSlice";

const TABS = [
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/workspaces", label: "Workspaces", icon: FolderKanban },
  { to: "/apps", label: "Apps", icon: Layers },
  { to: "/admin-users", label: "Admins", icon: ShieldCheck },
];

export function Layout() {
  const loc = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const initials = (user?.name ?? "?").slice(0, 2).toUpperCase();

  return (
    <MantineShell header={{ height: 60 }} padding="lg">
      <MantineShell.Header style={{ background: "var(--bg-2)", borderBottom: "1px solid var(--border)" }}>
        <Group h="100%" px="lg" justify="space-between" wrap="nowrap">
          <Group gap="xl" wrap="nowrap">
            <Link to="/customers" style={{ display: "flex", flexShrink: 0 }}>
              <Wordmark />
            </Link>
            <Group gap="lg" wrap="nowrap">
              {TABS.map((t) => (
                <UnstyledButton
                  key={t.to}
                  component={Link}
                  to={t.to}
                  className="top-nav-link"
                  data-active={loc.pathname === t.to || loc.pathname.startsWith(t.to + "/")}
                >
                  <Group gap={6} wrap="nowrap">
                    <t.icon size={15} />
                    {t.label}
                  </Group>
                </UnstyledButton>
              ))}
            </Group>
          </Group>

          <Menu position="bottom-end" withArrow radius="md" width={200} zIndex={400}>
            <Menu.Target>
              <UnstyledButton style={{ flexShrink: 0 }}>
                <Group gap={8} wrap="nowrap">
                  <Avatar color="indigo" radius="xl" size="sm">
                    {initials}
                  </Avatar>
                  <Text size="sm" fw={500} visibleFrom="sm">{user?.name}</Text>
                  <ChevronDown size={14} style={{ color: "var(--muted)" }} />
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>{user?.email}</Menu.Label>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={<LogOut size={15} />}
                onClick={() => {
                  dispatch(logout());
                  navigate("/login");
                }}
              >
                Sign out
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </MantineShell.Header>

      <MantineShell.Main style={{ background: "var(--bg)" }}>
        <div key={loc.pathname} className="route-fade">
          <Outlet />
        </div>
      </MantineShell.Main>
    </MantineShell>
  );
}
