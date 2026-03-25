import { type NextRequest, NextResponse } from 'next/server';

import { getReleases } from '@/app/(public)/releases/utils/get-releases';

export interface ReleaseNote {
  slug: string;
  date: string;
  release: string;
  content: string;
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const host = request.nextUrl.hostname;
  const protocol = request.nextUrl.protocol;
  const baseUrl = `${protocol}//${host}`;

  console.log(baseUrl);

  return NextResponse.json(await getReleases(baseUrl), { status: 200 });
}
