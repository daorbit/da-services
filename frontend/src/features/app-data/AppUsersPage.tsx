import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Table, Group, Title, Text, TextInput, Badge, Stack, Box, Avatar, Pagination,
} from "@mantine/core";
import { Search } from "lucide-react";
import { api } from "@/lib/api";

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl: string;
  createdAt: string;
  workspaceCount: number;
  plan: { planSlug: string; expired: boolean } | null;
};

export function AppUsersPage() {
  const { appSlug } = useParams<{ appSlug: string }>();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setPage(1);
  }, [appSlug]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api.get(`/apps/${appSlug}/users`, { params: { q, page } }).then(({ data }) => {
        setUsers(data.users);
        setPages(data.pages);
        setTotal(data.total);
        setLoading(false);
      });
    }, 250);
    return () => clearTimeout(t);
  }, [appSlug, q, page]);

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={2}>Users</Title>
          <Text c="dimmed" size="sm" mt={4}>
            {total} account{total === 1 ? "" : "s"}.
          </Text>
        </div>
        <TextInput
          placeholder="Search name or email"
          leftSection={<Search size={15} />}
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.currentTarget.value);
          }}
          w={260}
        />
      </Group>

      <Box className="tile" p={0} style={{ overflow: "hidden" }}>
        <Box style={{ overflowX: "auto" }}>
          <Table verticalSpacing="sm" horizontalSpacing="lg">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Account</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Workspaces</Table.Th>
                <Table.Th>Plan</Table.Th>
                <Table.Th>Joined</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {users.map((u) => (
                <Table.Tr key={u.id}>
                  <Table.Td>
                    <Group gap="sm" wrap="nowrap">
                      <Avatar src={u.avatarUrl || undefined} radius="xl" size="sm" color="indigo">
                        {u.name.slice(0, 2).toUpperCase()}
                      </Avatar>
                      <Box style={{ minWidth: 0 }}>
                        <Text size="sm" fw={600} truncate>{u.name}</Text>
                        <Text size="xs" c="dimmed" truncate>{u.email}</Text>
                      </Box>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={u.role === "super_admin" ? "indigo" : "gray"}>
                      {u.role}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {u.workspaceCount}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    {u.plan ? (
                      <Badge variant="light" color={u.plan.expired ? "gray" : "indigo"}>
                        {u.plan.planSlug}{u.plan.expired ? " · expired" : ""}
                      </Badge>
                    ) : (
                      <Text size="xs" c="dimmed">—</Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
              {!loading && users.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Text c="dimmed" size="sm" ta="center" py="lg">
                      No accounts match.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Box>
      </Box>

      {pages > 1 && (
        <Group justify="center">
          <Pagination value={page} onChange={setPage} total={pages} color="indigo" />
        </Group>
      )}
    </Stack>
  );
}
