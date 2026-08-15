import { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppShell as MantineShell, Group, Text, ActionIcon, ScrollArea, Box,
  useMantineColorScheme, useComputedColorScheme, UnstyledButton, Menu,
  Burger, Avatar,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import {
  ShieldCheck, LogOut, Moon, Sun, Settings as SettingsIcon, ChevronsUpDown,
  FolderKanban, Users, Layers,
} from "lucide-react";
import { Wordmark } from "@/shared/components/Brand";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { logout } from "@/features/auth/authSlice";
import { useApps } from "@/features/apps/useApps";

function NavItem({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: string;
  label: string;
  icon: typeof ShieldCheck;
  active: boolean;
}) {
  return (
    <UnstyledButton
      component={Link}
      to={to}
      className="nav-link"
      data-active={active}
      aria-current={active ? "page" : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "8px 10px",
        marginBottom: 2,
        color: active ? "var(--text)" : "var(--text-2)",
      }}
    >
      <Icon size={17} style={{ flexShrink: 0, color: active ? "var(--accent-2)" : undefined }} />
      <Text size="sm" fw={active ? 600 : 500} truncate>
        {label}
      </Text>
    </UnstyledButton>
  );
}

export function Layout() {
  const loc = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const { setColorScheme } = useMantineColorScheme();
  const scheme = useComputedColorScheme("dark");
  const dark = scheme === "dark";
  const mobile = useMediaQuery("(max-width: 48em)") ?? false;
  const { apps } = useApps();

  const [navOpen, { toggle: toggleNav, close: closeNav }] = useDisclosure(false);
  useEffect(() => {
    closeNav();
  }, [loc.pathname, closeNav]);

  const initials = (user?.name ?? "?").slice(0, 2).toUpperCase();

  const navGroups = [
    {
      heading: "Ecosystem",
      items: [{ to: "/apps", label: "Apps", icon: Layers }],
    },
    ...apps.map((app) => ({
      heading: app.name,
      items: [
        { to: `/apps/${app.slug}/workspaces`, label: "Workspaces", icon: FolderKanban },
        { to: `/apps/${app.slug}/users`, label: "Users", icon: Users },
      ],
    })),
    {
      heading: "Manage",
      items: [{ to: "/admin-users", label: "Admin users", icon: ShieldCheck }],
    },
  ];

  return (
    <MantineShell
      header={{ height: { base: 56, sm: 0 } }}
      navbar={{ width: 252, breakpoint: "sm", collapsed: { mobile: !navOpen } }}
      padding="lg"
    >
      <MantineShell.Header
        px="md"
        hiddenFrom="sm"
        style={{ background: "var(--bg-2)", borderBottom: "1px solid var(--border)" }}
      >
        <Group h="100%" gap="sm">
          <Burger opened={navOpen} onClick={toggleNav} size="sm" aria-label="Toggle navigation" />
          <Wordmark />
        </Group>
      </MantineShell.Header>

      <MantineShell.Navbar
        p="sm"
        style={{ background: "var(--bg-2)", borderRight: "1px solid var(--border)" }}
      >
        <MantineShell.Section visibleFrom="sm">
          <Box px={6} pt={6} pb="md">
            <Wordmark />
          </Box>
        </MantineShell.Section>

        <MantineShell.Section grow component={ScrollArea} type="never">
          {navGroups.map((group) => (
            <Box key={group.heading} mb="md">
              <p className="nav-heading">{group.heading}</p>
              {group.items.map((n) => (
                <NavItem key={n.to} to={n.to} label={n.label} icon={n.icon} active={loc.pathname === n.to} />
              ))}
            </Box>
          ))}
        </MantineShell.Section>

        <MantineShell.Section>
          <Group gap={4} mb="xs" px={2}>
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => setColorScheme(dark ? "light" : "dark")}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </ActionIcon>
          </Group>

          <Menu
            position={mobile ? "top" : "right-end"}
            withArrow
            radius="md"
            width={mobile ? "target" : 210}
            withinPortal
            zIndex={400}
          >
            <Menu.Target>
              <UnstyledButton className="tile" style={{ display: "block", width: "100%", padding: 8 }}>
                <Group gap="sm" wrap="nowrap">
                  <Avatar color="indigo" radius="md" size="md">
                    {initials}
                  </Avatar>
                  <Box style={{ flex: 1, overflow: "hidden" }}>
                    <Text size="sm" fw={600} truncate>{user?.name}</Text>
                    <Text size="xs" c="dimmed" truncate>{user?.email}</Text>
                  </Box>
                  <ChevronsUpDown size={14} style={{ flexShrink: 0, color: "var(--muted)" }} />
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item leftSection={<SettingsIcon size={15} />} disabled>
                Settings
              </Menu.Item>
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
        </MantineShell.Section>
      </MantineShell.Navbar>

      <MantineShell.Main style={{ background: "var(--bg)" }}>
        <div key={loc.pathname} className="route-fade">
          <Outlet />
        </div>
      </MantineShell.Main>
    </MantineShell>
  );
}
