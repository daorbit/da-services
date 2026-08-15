import { useEffect, useState } from "react";
import {
  Table, Group, Title, Text, TextInput, Select, Badge, Stack, Box, Avatar, Pagination,
} from "@mantine/core";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import { useApps } from "@/features/apps/useApps";

type CustomerRow = {
  id: string;
  app: string;
  appName: string;
  email: string;
  name: string;
  role: string;
  avatarUrl: string;
  createdAt: string;
  workspaceCount: number;
  plan: { planSlug: string; expired: boolean } | null;
};

export function CustomersPage() {
  const { apps } = useApps();
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [appFilter, setAppFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api.get("/customers", { params: { q, app: appFilter ?? "", page } }).then(({ data }) => {
        setCustomers(data.customers);
        setPages(data.pages);
        setTotal(data.total);
        setLoading(false);
      });
    }, 250);
    return () => clearTimeout(t);
  }, [q, appFilter, page]);

  return (
    <Stack gap="xl" maw={1200} mx="auto">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={2}>Customers</Title>
          <Text c="dimmed" size="sm" mt={4}>
            {total} account{total === 1 ? "" : "s"} across every app in the ecosystem.
          </Text>
        </div>
        <Group gap="sm">
          <Select
            placeholder="All apps"
            data={apps.map((a) => ({ value: a.slug, label: a.name }))}
            value={appFilter}
            onChange={(v) => {
              setPage(1);
              setAppFilter(v);
            }}
            clearable
            w={180}
          />
          <TextInput
            placeholder="Search name or email"
            leftSection={<Search size={15} />}
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.currentTarget.value);
            }}
            w={240}
          />
        </Group>
      </Group>

      <Box className="card" p={0} style={{ overflow: "hidden" }}>
        <Box style={{ overflowX: "auto" }}>
          <Table verticalSpacing="md" horizontalSpacing="xl">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Account</Table.Th>
                <Table.Th>App</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Workspaces</Table.Th>
                <Table.Th>Plan</Table.Th>
                <Table.Th>Joined</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {customers.map((c) => (
                <Table.Tr key={`${c.app}-${c.id}`}>
                  <Table.Td>
                    <Group gap="sm" wrap="nowrap">
                      <Avatar src={c.avatarUrl || undefined} radius="xl" size="sm" color="indigo">
                        {c.name.slice(0, 2).toUpperCase()}
                      </Avatar>
                      <Box style={{ minWidth: 0 }}>
                        <Text size="sm" fw={600} truncate>{c.name}</Text>
                        <Text size="xs" c="dimmed" truncate>{c.email}</Text>
                      </Box>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="outline" color="gray">{c.appName}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={c.role === "super_admin" ? "indigo" : "gray"}>
                      {c.role}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {c.workspaceCount}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    {c.plan ? (
                      <Badge variant="light" color={c.plan.expired ? "gray" : "indigo"}>
                        {c.plan.planSlug}{c.plan.expired ? " · expired" : ""}
                      </Badge>
                    ) : (
                      <Text size="xs" c="dimmed">—</Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">{new Date(c.createdAt).toLocaleDateString()}</Text>
                  </Table.Td>
                </Table.Tr>
              ))}
              {!loading && customers.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <Text c="dimmed" size="sm" ta="center" py="lg">
                      No customers match.
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
