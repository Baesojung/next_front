'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  Alert,
  AppShell,
  Badge,
  Burger,
  Button,
  Card,
  Group,
  Loader,
  NumberInput,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import Navbar from '@/components/Navbar';

type EtfResult = {
  ETF: string;
  '거래일 수': number;
  '총 납입액': number;
  '최종 평가액': number;
  '총 수익': number;
  '총 수익률%': number;
  '보유 수량': number;
  '평균 매입단가': number;
  '세후 배당금': number;
  '최종 주가': number;
  '배당세율%': number;
  '거래비용%(편도)': number;
};

type ApiPayload = {
  start_date: string;
  end_date: string;
  daily_contribution: number;
  etf_count: number;
  results: EtfResult[];
  errors: string[];
};

type ApiRequest = Pick<ApiPayload, 'start_date' | 'end_date' | 'daily_contribution' | 'etf_count'>;

const columns: { key: keyof EtfResult; label: string }[] = [
  { key: 'ETF', label: 'ETF' },
  { key: '거래일 수', label: '거래일 수' },
  { key: '총 납입액', label: '총 납입액 (KRW)' },
  { key: '최종 평가액', label: '최종 평가액 (KRW)' },
  { key: '총 수익', label: '총 수익 (KRW)' },
  { key: '총 수익률%', label: '총 수익률%' },
  { key: '보유 수량', label: '보유 수량' },
  { key: '평균 매입단가', label: '평균 매입단가' },
  { key: '세후 배당금', label: '세후 배당금' },
  { key: '최종 주가', label: '최종 주가' },
  { key: '배당세율%', label: '배당세율%' },
  { key: '거래비용%(편도)', label: '거래비용%(편도)' },
];

const currencyKeys = new Set<keyof EtfResult>(['총 납입액', '최종 평가액', '총 수익']);
const decimalCurrencyKeys = new Set<keyof EtfResult>(['평균 매입단가', '세후 배당금', '최종 주가']);

const decimalKeys = new Set<keyof EtfResult>(['보유 수량']);
const percentKeys = new Set<keyof EtfResult>(['총 수익률%', '배당세율%', '거래비용%(편도)']);

const numberFormatter = new Intl.NumberFormat('ko-KR');
const decimalFormatter = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 });
const dateRegExp = /^\d{4}-\d{2}-\d{2}$/;

function parseNumberValue(value: string | number, fallback: number) {
  if (typeof value === 'number') {
    return value;
  }
  const parsed = Number(value.replace(/,/g, ''));
  return Number.isNaN(parsed) ? fallback : parsed;
}

function formatValue(key: keyof EtfResult, value: string | number) {
  if (typeof value !== 'number') {
    return value;
  }

  if (percentKeys.has(key)) {
    return `${decimalFormatter.format(value)}%`;
  }

  if (decimalKeys.has(key)) {
    return decimalFormatter.format(value);
  }

  if (currencyKeys.has(key)) {
    return numberFormatter.format(Math.round(value));
  }

  if (decimalCurrencyKeys.has(key)) {
    return decimalFormatter.format(value);
  }

  return numberFormatter.format(value);
}

function isValidDateString(value: string) {
  if (!dateRegExp.test(value)) {
    return false;
  }
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

export default function PaperTradingResultsPage() {
  const [opened, { toggle }] = useDisclosure();
  const [data, setData] = useState<ApiPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const initialRequestRef = useRef<ApiRequest>({
    start_date: '2023-01-01',
    end_date: '2024-01-01',
    daily_contribution: 5000,
    etf_count: 2,
  });
  const [requestConfig, setRequestConfig] = useState<ApiRequest>(initialRequestRef.current);
  const invalidStartDate = !isValidDateString(requestConfig.start_date);
  const invalidEndDate = !isValidDateString(requestConfig.end_date);
  const formInvalid = invalidStartDate || invalidEndDate;
  const handleDateChange = useCallback(
    (key: 'start_date' | 'end_date') => (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.currentTarget?.value ?? '';
      setRequestConfig((prev) => ({ ...prev, [key]: nextValue }));
    },
    []
  );

  const loadResults = useCallback(async (config: ApiRequest) => {
    setLoading(true);
    setError(null);
    try {
      if (!isValidDateString(config.start_date) || !isValidDateString(config.end_date)) {
        throw new Error('날짜는 YYYY-MM-DD 형식으로 입력해주세요.');
      }
      const response = await fetch('/api/etf-periodic-investment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      if (!response.ok) {
        let errorMessage = '데이터를 불러오지 못했습니다.';
        try {
          const errorPayload = await response.json();
          if (errorPayload?.errors?.length) {
            errorMessage = errorPayload.errors.join(', ');
          }
        } catch (err) {
          console.error(err);
        }
        throw new Error(errorMessage);
      }

      const payload: ApiPayload = await response.json();
      if (!payload || !Array.isArray(payload.results)) {
        throw new Error('API 응답 형식이 올바르지 않습니다.');
      }

      setData(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    loadResults(requestConfig);
  }, [loadResults, requestConfig]);

  useEffect(() => {
    loadResults(initialRequestRef.current);
  }, [loadResults]);

  const hasErrorsFromApi = data?.errors?.length;

  const summaryItems = useMemo(
    () => [
      { label: '기간', value: data ? `${data.start_date} ~ ${data.end_date}` : '-' },
      { label: '일일 납입액', value: data ? `${numberFormatter.format(data.daily_contribution)} KRW` : '-' },
      { label: 'ETF 종목 수', value: data ? `${data.etf_count}개` : '-' },
    ],
    [data]
  );

  const sortedResults = useMemo(() => {
    if (!data?.results?.length) {
      return [];
    }
    const clone = [...data.results];
    const multiplier = sortDirection === 'desc' ? -1 : 1;
    return clone.sort(
      (a, b) => multiplier * (a['총 수익률%'] - b['총 수익률%'])
    );
  }, [data?.results, sortDirection]);

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
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" aria-label="앱 네비게이션 열기" />
          <Text fw={600}>ETF 적립식 투자 결과</Text>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p={0}>
        <Navbar />
      </AppShell.Navbar>
      <AppShell.Main>
        <Stack gap="lg">
          <Group justify="space-between" align="flex-start">
            <Stack gap={4}>
              <Title order={3}>정기 투자 시뮬레이션</Title>
              <Text c="dimmed" fz="sm">
                지정된 기간 동안 동일 금액을 투자했을 때의 결과를 요약합니다.
              </Text>
            </Stack>
            <Button
              leftSection={<IconRefresh size={16} />}
              variant="light"
              size="sm"
              onClick={handleRefresh}
              loading={loading}
              disabled={formInvalid}
            >
              새로고침
            </Button>
          </Group>

          <Card withBorder padding="lg" radius="md">
            <Stack gap="sm">
              <Group grow>
                <TextInput
                  label="시작일"
                  type="date"
                  value={requestConfig.start_date}
                  onChange={handleDateChange('start_date')}
                  placeholder="YYYY-MM-DD"
                  error={invalidStartDate ? 'YYYY-MM-DD 형식으로 입력해주세요.' : undefined}
                />
                <TextInput
                  label="종료일"
                  type="date"
                  value={requestConfig.end_date}
                  onChange={handleDateChange('end_date')}
                  placeholder="YYYY-MM-DD"
                  error={invalidEndDate ? 'YYYY-MM-DD 형식으로 입력해주세요.' : undefined}
                />
              </Group>
              <Group grow>
                <NumberInput
                  label="일일 납입액 (KRW)"
                  value={requestConfig.daily_contribution}
                  min={0}
                  thousandSeparator=","
                  onChange={(value) =>
                    setRequestConfig((prev) => ({
                      ...prev,
                      daily_contribution: parseNumberValue(value, prev.daily_contribution),
                    }))
                  }
                />
                <NumberInput
                  label="ETF 종목 수"
                  value={requestConfig.etf_count}
                  min={1}
                  max={10}
                  onChange={(value) =>
                    setRequestConfig((prev) => ({
                      ...prev,
                      etf_count: parseNumberValue(value, prev.etf_count),
                    }))
                  }
                />
              </Group>
              <Group justify="flex-end">
                <Button onClick={handleRefresh} loading={loading} disabled={formInvalid}>
                  시뮬레이션 실행
                </Button>
              </Group>
            </Stack>
          </Card>

          <Card withBorder padding="lg" radius="md">
            <Stack gap="sm">
              <Group>
                {summaryItems.map((item) => (
                  <Stack key={item.label} gap={0}>
                    <Text c="dimmed" fz="xs">
                      {item.label}
                    </Text>
                    <Text fw={500}>{item.value}</Text>
                  </Stack>
                ))}
              </Group>
              {loading && (
                <Group gap="xs" align="center">
                  <Loader size="xs" />
                  <Text c="dimmed" fz="sm">
                    데이터를 불러오는 중입니다...
                  </Text>
                </Group>
              )}
              {error && (
                <Alert icon={<IconAlertCircle size={16} />} color="red" title="오류">
                  {error}
                </Alert>
              )}
              {hasErrorsFromApi && (
                <Alert icon={<IconAlertCircle size={16} />} color="yellow" title="API 오류">
                  {(data?.errors ?? []).join(', ')}
                </Alert>
              )}
            </Stack>
          </Card>

          <Card withBorder padding="lg" radius="md">
            <Stack gap="sm">
              <Group>
                <Text fw={600}>ETF별 결과</Text>
                {data?.results && (
                  <Badge color="blue" variant="light">
                    {data.results.length} 종목
                  </Badge>
                )}
                <Button
                  size="xs"
                  variant="default"
                  onClick={() => setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                  style={{ marginLeft: 'auto' }}
                >
                  총 수익률 {sortDirection === 'desc' ? '내림차순' : '오름차순'}
                </Button>
              </Group>
              <ScrollArea>
                <Table horizontalSpacing="md" verticalSpacing="xs" withColumnBorders>
                  <Table.Thead>
                    <Table.Tr>
                      {columns.map((column) => (
                        <Table.Th key={column.key}>{column.label}</Table.Th>
                      ))}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {sortedResults.length ? (
                      sortedResults.map((row) => (
                        <Table.Tr key={row.ETF}>
                          {columns.map((column) => (
                            <Table.Td key={column.key}>{formatValue(column.key, row[column.key])}</Table.Td>
                          ))}
                        </Table.Tr>
                      ))
                    ) : (
                      <Table.Tr>
                        <Table.Td colSpan={columns.length}>
                          <Text c="dimmed" ta="center">
                            {loading ? '데이터를 불러오는 중입니다.' : '표시할 결과가 없습니다.'}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </Stack>
          </Card>
        </Stack>
      </AppShell.Main>
    </AppShell>
  );
}
