import { GithubReleases } from '@/database/model';

function formatDate(dateString: string) {
  const date = new Date(dateString);

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return formatter.format(date) + getOrdinal(date.getDate());
}

function getOrdinal(day: number) {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

export const getGithubReleaseDateFromReleaseNote = (
  githubReleases: GithubReleases[],
  noteTagName: string,
  noteDate: string,
) => {
  const formattedNoteTagName = `v${noteTagName}`;
  const date = githubReleases?.find?.(
    (githubRelease) => githubRelease?.tagName === formattedNoteTagName,
  )?.publishedAt;

  if (date) {
    return formatDate(date);
  }

  return noteDate;
};
