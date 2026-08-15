import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Stack, Group, Title, Text, Badge, Box, Loader, Center, SimpleGrid, Table,
} from "@mantine/core";
import { ArrowLeft, Globe, CreditCard } from "lucide-react";
import { api } from "@/lib/api";

type Detail = {
  workspace: { id: string; name: string; slug: string; createdAt: string };
  owner: { id: string; email: string; name: string; role: string; createdAt: string } | null;
  subscription: {
    planSlug: string;
    orbitPlanSlug: string | null;
    cycle: string;
    status: string;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    auditsUsed: number;
    crawlsUsed: number;
    eventsUsed: number;
  } | null;
  sites: { id: string; siteId: string; domain: string; createdAt: string }[];
};

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Box className="tile" p="md">
      <Text size="xs" c="dimmed" tt="uppercase" fw={700} style={{ letterSpacing: "0.06em" }}>
        {label}
      </Text>
      <Text size="xl" fw={700} mt={4} style={{ fontFamily: "var(--font-display, inherit)" }}>
        {value}
      </Text>
    </Box>
  );
}

export function AppWorkspaceDetailPage() {
  const { appSlug, id } = useParams<{ appSlug: string; id: string }>();
  const [data, setData] = useState<Detail | null>(null);

  useEffect(() => {
    api.get(`/apps/${appSlug}/workspaces/${id}`).then(({ data }) => setData(data));
  }, [appSlug, id]);

  if (!data) {
    return (
      <Center mih={300}>
        <Loader />
      </Center>
    );
  }

  const { workspace, owner, subscription, sites } = data;
  const expired = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).getTime() < Date.now()
    : true;

  return (
    <Stack gap="lg">
      <Group gap="xs">
        <Text
          component={Link}
          to={`/apps/${appSlug}/workspaces`}
          size="sm"
          c="dimmed"
          style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}
        >
          <ArrowLeft size={14} /> Workspaces
        </Text>
      </Group>

      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={2}>{workspace.name}</Title>
          <Text c="dimmed" size="sm" mt={4}>
            {workspace.slug} · created {new Date(workspace.createdAt).toLocaleDateString()}
          </Text>
        </div>
        {subscription && (
          <Badge size="lg" variant="light" color={expired ? "gray" : "indigo"}>
            {subscription.planSlug}{expired ? " · expired" : ""}
          </Badge>
        )}
      </Group>

      {owner && (
        <Box className="tile" p="md">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={8} style={{ letterSpacing: "0.06em" }}>
            Owner
          </Text>
          <Group justify="space-between">
            <div>
              <Text size="sm" fw={600}>{owner.name}</Text>
              <Text size="xs" c="dimmed">{owner.email}</Text>
            </div>
            <Badge variant="light" color={owner.role === "super_admin" ? "indigo" : "gray"}>
              {owner.role}
            </Badge>
          </Group>
        </Box>
      )}

      {subscription && (
        <>
          <Group gap="xs" mt="sm">
            <CreditCard size={15} style={{ color: "var(--muted)" }} />
            <Text size="sm" fw={600}>Billing this cycle</Text>
          </Group>
          <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm">
            <StatTile label="Audits used" value={String(subscription.auditsUsed ?? 0)} />
            <StatTile label="Crawls used" value={String(subscription.crawlsUsed ?? 0)} />
            <StatTile label="Events used" value={(subscription.eventsUsed ?? 0).toLocaleString()} />
            <StatTile label="Cycle" value={subscription.cycle} />
            <StatTile
              label="Period ends"
              value={subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : "—"}
            />
            <StatTile label="Orbit plan" value={subscription.orbitPlanSlug ?? "free"} />
          </SimpleGrid>
        </>
      )}

      <Group gap="xs" mt="sm">
        <Globe size={15} style={{ color: "var(--muted)" }} />
        <Text size="sm" fw={600}>Sites ({sites.length})</Text>
      </Group>
      <Box className="tile" p={0} style={{ overflow: "hidden" }}>
        <Box style={{ overflowX: "auto" }}>
          <Table verticalSpacing="sm" horizontalSpacing="lg">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Domain</Table.Th>
                <Table.Th>Site ID</Table.Th>
                <Table.Th>Added</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sites.map((s) => (
                <Table.Tr key={s.id}>
                  <Table.Td><Text size="sm" fw={500}>{s.domain}</Text></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed" ff="monospace">{s.siteId}</Text></Table.Td>
                  <Table.Td><Text size="sm" c="dimmed">{new Date(s.createdAt).toLocaleDateString()}</Text></Table.Td>
                </Table.Tr>
              ))}
              {sites.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={3}>
                    <Text c="dimmed" size="sm" ta="center" py="lg">No sites in this workspace.</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Box>
      </Box>
    </Stack>
  );
}
