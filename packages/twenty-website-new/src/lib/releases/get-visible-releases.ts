import type { LocalReleaseNote } from '@/lib/releases/types';
import { getFormattedReleaseNumber } from '@/lib/releases/get-formatted-release-number';

function safeReleaseNumber(version: string): number | null {
  try {
    return getFormattedReleaseNumber(version);
  } catch {
    return null;
  }
}

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
