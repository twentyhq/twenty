import type { LocalReleaseNote } from '@/lib/releases/types';
import { getFormattedReleaseNumber } from '@/lib/semver/get-formatted-release-number';

function safeReleaseNumber(version: string): number | null {
  try {
    return getFormattedReleaseNumber(version);
  } catch {
    return null;
  }
}

/**
 * Returns the subset of release notes that are safe to show on the marketing
 * site, given the latest tag published on GitHub.
 *
 * The contract is intentionally fail-closed: if we don't have a trustworthy
 * "latest published tag" for any reason (network error, parse error,
 * unrecognised semver format), we return an empty list. The page treats an
 * empty list as a clean "no releases visible yet" empty state.
 *
 * Failing open here would let us announce internal/unpublished versions on
 * the public site whenever GitHub is flaky — which is exactly the failure
 * mode this function exists to prevent.
 */
export function getVisibleReleaseNotes(
  notes: LocalReleaseNote[],
  latestPublishedTag: string | null,
): LocalReleaseNote[] {
  if (!latestPublishedTag) {
    return [];
  }

  const publishedNumber = safeReleaseNumber(latestPublishedTag);
  if (publishedNumber === null) {
    return [];
  }

  return notes.filter((note) => {
    const noteNumber = safeReleaseNumber(note.release);
    if (noteNumber === null) {
      return false;
    }
    return noteNumber <= publishedNumber;
  });
}
