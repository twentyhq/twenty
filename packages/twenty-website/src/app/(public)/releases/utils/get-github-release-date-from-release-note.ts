import { type GithubReleases } from '@/database/model';

// Return an ISO date string so downstream components can format consistently
export const getGithubReleaseDateFromReleaseNote = (
  githubReleases: GithubReleases[],
  noteTagName: string,
  noteDate: string,
) => {
  const formattedNoteTagName = `v${noteTagName}`;
  const publishedAt = githubReleases?.find?.(
    (githubRelease) => githubRelease?.tagName === formattedNoteTagName,
  )?.publishedAt;

  // If we have a GitHub publishedAt date, return it as-is (ISO date string)
  if (publishedAt) {
    return publishedAt;
  }

  // Fall back to the MDX frontmatter date
  return noteDate;
};

