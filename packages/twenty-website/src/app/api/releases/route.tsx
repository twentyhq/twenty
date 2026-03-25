import { desc } from 'drizzle-orm';

import { getGithubReleaseDateFromReleaseNote } from '@/app/(public)/releases/utils/get-github-release-date-from-release-note';
import { getReleases } from '@/app/(public)/releases/utils/get-releases';
import { getVisibleReleases } from '@/app/(public)/releases/utils/get-visible-releases';
import { findAll } from '@/database/database';
import { type GithubReleases, githubReleasesModel } from '@/database/model';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const githubReleases = (await findAll(
      githubReleasesModel,
      desc(githubReleasesModel.publishedAt),
    )) as GithubReleases[];

    const latestGithubRelease = githubReleases[0];
    const releaseNotes = await getReleases();

    const visibleReleasesNotes = getVisibleReleases(
      releaseNotes,
      latestGithubRelease.tagName,
    );

    const formattedReleasesNotes = visibleReleasesNotes.map((releaseNote) => {
      const updatedContent = releaseNote.content.replace(
        /!\[(.*?)\]\((\/images\/.*?)\)/g,
        (match, altText, imagePath) => {
          return `![${altText}](https://twenty.com${imagePath})`;
        },
      );

      return {
        ...releaseNote,
        content: updatedContent,
        publishedAt: getGithubReleaseDateFromReleaseNote(
          githubReleases,
          releaseNote.release,
          releaseNote.date,
        ),
      };
    });

    return Response.json(formattedReleasesNotes);
  } catch (error: any) {
    return new Response(`Github releases error: ${error?.message}`, {
      status: 500,
    });
  }
}
