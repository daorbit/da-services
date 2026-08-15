import { useEffect, useState } from "react";
import {
  Table, Button, Group, Title, Modal, TextInput, PasswordInput, Select,
  Badge, ActionIcon, Stack,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
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
    try {
      await api.post("/admin-users", form);
      setModalOpen(false);
      setForm({ email: "", password: "", name: "", role: "admin" });
      notifications.show({ message: "Admin user created", color: "green" });
      load();
    } catch (e: any) {
      notifications.show({ message: e.response?.data?.error ?? "failed", color: "red" });
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
    <Stack>
      <Group justify="space-between">
        <Title order={3}>Admin Users</Title>
        <Button onClick={() => setModalOpen(true)}>New admin</Button>
      </Group>

      <Table striped highlightOnHover>
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
              <Table.Td>{u.name}</Table.Td>
              <Table.Td>{u.email}</Table.Td>
              <Table.Td>
                <Badge color={u.role === "super_admin" ? "grape" : "blue"}>{u.role}</Badge>
              </Table.Td>
              <Table.Td>
                <Badge color={u.active ? "green" : "gray"}>{u.active ? "active" : "disabled"}</Badge>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon variant="light" onClick={() => toggleActive(u)}>
                    {u.active ? "⏸" : "▶"}
                  </ActionIcon>
                  <ActionIcon variant="light" color="red" onClick={() => removeUser(u)}>
                    ✕
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
          {!loading && users.length === 0 && (
            <Table.Tr>
              <Table.Td colSpan={5}>No admin users yet.</Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="New admin user">
        <Stack>
          <TextInput
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
          />
          <TextInput
            label="Email"
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
          />
          <Button onClick={createUser}>Create</Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
