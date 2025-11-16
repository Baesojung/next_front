'use client';

import { AppShell, Burger, Button, Card, Group, Stack, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Navbar from '@/components/Navbar';

export default function PaperTradingPage() {
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
          <Text fw={600}>모의투자</Text>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p={0}>
        <Navbar />
      </AppShell.Navbar>
      <AppShell.Main>
        <Stack gap="lg">
          <Stack gap={4}>
            <Title order={3}>모의투자</Title>
            <Text c="dimmed" fz="sm">
              가상의 잔고로 전략을 실험하고 리스크 없이 시장 흐름을 연습하세요.
            </Text>
          </Stack>

          <Card withBorder padding="lg" radius="md">
            <Group justify="space-between" align="flex-start">
              <div>
                <Text fw={600}>가상 자산 계좌</Text>
                <Text c="dimmed" fz="sm">
                  기본 증거금 10,000,000 KRW이 지급되었습니다.
                </Text>
              </div>
              <Button size="sm">새 포트폴리오 만들기</Button>
            </Group>
          </Card>

          <Card withBorder radius="md">
            <Stack gap="xs">
              <Text fw={500}>최근 활동</Text>
              <Text c="dimmed" fz="sm">
                아직 체결된 주문이 없습니다. 관심 종목을 추가하고 첫 모의 주문을 넣어
                보세요.
              </Text>
            </Stack>
          </Card>
        </Stack>
      </AppShell.Main>
    </AppShell>
  );
}
