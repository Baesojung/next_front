'use client';

import { AppShell, Burger, Group, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Chart from '@/components/Chart';
import Navbar from '@/components/Navbar';

export default function Page() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 80,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size="sm"
            aria-label="앱 네비게이션 열기"
          />
          <Text fw={600}>Dashboard</Text>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p={0}>
        <Navbar />
      </AppShell.Navbar>
      <AppShell.Main style={{ height: 'calc(100vh - 60px)' }}>
        <Stack gap="lg" h="500px">
          <Chart height="500px" />
        </Stack>
      </AppShell.Main>
    </AppShell>
  );
}
