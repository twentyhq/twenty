import { desc } from 'drizzle-orm';

import { getReleases } from '@/app/releases/utils/get-releases';
import { getVisibleReleases } from '@/app/releases/utils/get-visible-releases';
import { findAll } from '@/database/database';
import { GithubReleases, githubReleasesModel } from '@/database/model';
import { pgGithubReleasesModel } from '@/database/postgres/schema-postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
  const githubReleases = (await findAll(
    githubReleasesModel,
    desc(pgGithubReleasesModel.publishedAt),
  )) as GithubReleases[];

  const latestGithubRelease = githubReleases[0];
  const releaseNotes = await getReleases();
  try {
    return Response.json(
      getVisibleReleases(releaseNotes, latestGithubRelease.tagName),
    );
  } catch (error: any) {
    return new Response(`Github releases error: ${error?.message}`, {
      status: 500,
    });
  }
}
