import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.ETF_PERIODIC_INVESTMENT_URL ||
  'http://localhost:8000/api/etf-periodic-investment';

async function forwardRequest(body: unknown, signal?: AbortSignal) {
  const response = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      payload?.message || '외부 API 호출에 실패했습니다. 서버 상태를 확인해주세요.'
    );
  }

  return payload;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = await forwardRequest(body, request.signal);
    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    return NextResponse.json({ errors: [message] }, { status: 500 });
  }
}
