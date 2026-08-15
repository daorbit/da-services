import { useEffect, useState } from "react";
import {
  Table, Button, Group, Title, Text, Modal, TextInput, PasswordInput, Select,
  Badge, ActionIcon, Stack, Box, Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { UserPlus, Pause, Play, Trash2, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";

type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "admin";
  active: boolean;
};

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "", role: "admin" });

  async function load() {
    setLoading(true);
    const { data } = await api.get("/admin-users");
    setUsers(data.users);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function createUser() {
    setSaving(true);
    try {
      await api.post("/admin-users", form);
      setModalOpen(false);
      setForm({ email: "", password: "", name: "", role: "admin" });
      notifications.show({ message: "Admin user created", color: "green" });
      load();
    } catch (e: any) {
      notifications.show({ message: e.response?.data?.error ?? "Could not create admin", color: "red" });
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(user: AdminUserRow) {
    await api.patch(`/admin-users/${user.id}`, { active: !user.active });
    load();
  }

  async function removeUser(user: AdminUserRow) {
    await api.delete(`/admin-users/${user.id}`);
    load();
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={2}>Admin users</Title>
          <Text c="dimmed" size="sm" mt={4}>
            Who can sign in to this console, and what they can reach.
          </Text>
        </div>
        <Button leftSection={<UserPlus size={16} />} onClick={() => setModalOpen(true)}>
          New admin
        </Button>
      </Group>

      <Box className="tile" p={0} style={{ overflow: "hidden" }}>
        <Box style={{ overflowX: "auto" }}>
          <Table verticalSpacing="sm" horizontalSpacing="lg">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {users.map((u) => (
                <Table.Tr key={u.id}>
                  <Table.Td>
                    <Text size="sm" fw={600}>{u.name}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">{u.email}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      variant="light"
                      color={u.role === "super_admin" ? "indigo" : "gray"}
                      leftSection={u.role === "super_admin" ? <ShieldCheck size={11} /> : undefined}
                    >
                      {u.role}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={6} wrap="nowrap">
                      <Box
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: 999,
                          background: u.active ? "var(--success)" : "var(--muted)",
                          flexShrink: 0,
                        }}
                      />
                      <Text size="xs" c="dimmed">{u.active ? "Active" : "Disabled"}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4} justify="flex-end">
                      <Tooltip label={u.active ? "Disable" : "Enable"} withArrow>
                        <ActionIcon variant="subtle" color="gray" onClick={() => toggleActive(u)}>
                          {u.active ? <Pause size={15} /> : <Play size={15} />}
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Delete" withArrow>
                        <ActionIcon variant="subtle" color="red" onClick={() => removeUser(u)}>
                          <Trash2 size={15} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
              {!loading && users.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Text c="dimmed" size="sm" ta="center" py="lg">
                      No admin users yet.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Box>
      </Box>

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="New admin user" radius="md">
        <Stack>
          <TextInput
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
          />
          <TextInput
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.currentTarget.value })}
          />
          <PasswordInput
            label="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.currentTarget.value })}
          />
          <Select
            label="Role"
            data={[
              { value: "admin", label: "admin" },
              { value: "super_admin", label: "super_admin" },
            ]}
            value={form.role}
            onChange={(v) => setForm({ ...form, role: v ?? "admin" })}
            allowDeselect={false}
          />
          <Button onClick={createUser} loading={saving} mt="xs">
            Create admin
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
