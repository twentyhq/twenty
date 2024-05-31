import { ReleaseNote } from '@/app/releases/api/route';
import { getFormattedReleaseNumber } from '@/app/releases/utils/get-formatted-release-number';

export const getVisibleReleases = (
  releaseNotes: ReleaseNote[],
  publishedReleaseVersion: string,
) => {
  if (process.env.NODE_ENV !== 'production') return releaseNotes;

  const publishedVersionNumber = getFormattedReleaseNumber(
    publishedReleaseVersion,
  );

  return releaseNotes.filter(
    (releaseNote) =>
      getFormattedReleaseNumber(releaseNote.release) <= publishedVersionNumber,
  );
};
