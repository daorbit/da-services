import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table, Group, Title, Text, TextInput, Select, Badge, Stack, Box, Pagination,
} from "@mantine/core";
import { Search, FolderKanban } from "lucide-react";
import { api } from "@/lib/api";
import { useApps } from "@/features/apps/useApps";

type WorkspaceRow = {
  id: string;
  app: string;
  appName: string;
  name: string;
  slug: string;
  createdAt: string;
  owner: { id: string; email: string; name: string } | null;
  plan: { slug: string; expired: boolean } | null;
};

export function WorkspacesPage() {
  const { apps } = useApps();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<WorkspaceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [appFilter, setAppFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api.get("/workspaces", { params: { q, app: appFilter ?? "", page } }).then(({ data }) => {
        setWorkspaces(data.workspaces);
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
          <Title order={2}>Workspaces</Title>
          <Text c="dimmed" size="sm" mt={4}>
            {total} workspace{total === 1 ? "" : "s"} across every app. Open one for billing detail.
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
            placeholder="Search workspace name"
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
                <Table.Th>Workspace</Table.Th>
                <Table.Th>App</Table.Th>
                <Table.Th>Owner</Table.Th>
                <Table.Th>Plan</Table.Th>
                <Table.Th>Created</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {workspaces.map((w) => (
                <Table.Tr
                  key={`${w.app}-${w.id}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/workspaces/${w.app}/${w.id}`)}
                >
                  <Table.Td>
                    <Group gap="sm" wrap="nowrap">
                      <FolderKanban size={15} style={{ color: "var(--muted)", flexShrink: 0 }} />
                      <div>
                        <Text size="sm" fw={600}>{w.name}</Text>
                        <Text size="xs" c="dimmed">{w.slug}</Text>
                      </div>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="outline" color="gray">{w.appName}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">{w.owner?.email ?? "—"}</Text>
                  </Table.Td>
                  <Table.Td>
                    {w.plan ? (
                      <Badge variant="light" color={w.plan.expired ? "gray" : "indigo"}>
                        {w.plan.slug}{w.plan.expired ? " · expired" : ""}
                      </Badge>
                    ) : (
                      <Text size="xs" c="dimmed">—</Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">{new Date(w.createdAt).toLocaleDateString()}</Text>
                  </Table.Td>
                </Table.Tr>
              ))}
              {!loading && workspaces.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Text c="dimmed" size="sm" ta="center" py="lg">
                      No workspaces match.
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
