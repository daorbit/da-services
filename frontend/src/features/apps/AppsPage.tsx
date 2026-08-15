import { useState } from "react";
import {
  Stack, Group, Title, Text, Button, Table, Box, Badge, Modal, TextInput,
  PasswordInput, ActionIcon, Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Plus, Trash2, Layers } from "lucide-react";
import { api } from "@/lib/api";
import { useApps } from "./useApps";

export function AppsPage() {
  const { apps, loading, reload } = useApps();
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ slug: "", name: "", mongoUri: "", dbName: "" });

  async function register() {
    setSaving(true);
    try {
      await api.post("/apps", form);
      setModalOpen(false);
      setForm({ slug: "", name: "", mongoUri: "", dbName: "" });
      notifications.show({ message: "App registered", color: "green" });
      reload();
    } catch (e: any) {
      notifications.show({ message: e.response?.data?.error ?? "Could not register app", color: "red" });
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    await api.delete(`/apps/${id}`);
    reload();
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={2}>Ecosystem apps</Title>
          <Text c="dimmed" size="sm" mt={4}>
            Every app whose users and workspaces this console can read.
          </Text>
        </div>
        <Button leftSection={<Plus size={16} />} onClick={() => setModalOpen(true)}>
          Register app
        </Button>
      </Group>

      <Box className="card" p={0} style={{ overflow: "hidden" }}>
        <Box style={{ overflowX: "auto" }}>
          <Table verticalSpacing="sm" horizontalSpacing="lg">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>App</Table.Th>
                <Table.Th>Database</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {apps.map((a) => (
                <Table.Tr key={a.id}>
                  <Table.Td>
                    <Group gap="sm" wrap="nowrap">
                      <Layers size={15} style={{ color: "var(--muted)" }} />
                      <div>
                        <Text size="sm" fw={600}>{a.name}</Text>
                        <Text size="xs" c="dimmed">{a.slug}</Text>
                      </div>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed" ff="monospace">{a.dbName}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={a.active ? "indigo" : "gray"}>
                      {a.active ? "active" : "disabled"}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Tooltip label="Remove" withArrow>
                      <ActionIcon variant="subtle" color="red" onClick={() => remove(a.id)}>
                        <Trash2 size={15} />
                      </ActionIcon>
                    </Tooltip>
                  </Table.Td>
                </Table.Tr>
              ))}
              {!loading && apps.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Text c="dimmed" size="sm" ta="center" py="lg">
                      No apps registered yet.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Box>
      </Box>

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Register an app" radius="md">
        <Stack>
          <TextInput
            label="Slug"
            placeholder="quantalog"
            description="Lowercase, used in URLs and the API"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.currentTarget.value })}
          />
          <TextInput
            label="Display name"
            placeholder="Quantalog"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
          />
          <PasswordInput
            label="MongoDB connection string"
            placeholder="mongodb+srv://..."
            value={form.mongoUri}
            onChange={(e) => setForm({ ...form, mongoUri: e.currentTarget.value })}
          />
          <TextInput
            label="Database name"
            placeholder="realana"
            value={form.dbName}
            onChange={(e) => setForm({ ...form, dbName: e.currentTarget.value })}
          />
          <Button onClick={register} loading={saving} mt="xs">
            Register
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
