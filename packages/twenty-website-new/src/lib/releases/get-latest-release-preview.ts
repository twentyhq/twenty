import type { MenuNavChildPreview } from '@/sections/Menu/types';

import { loadLocalReleaseNotes } from '@/lib/releases/load-local-release-notes';

const IMAGE_REGEX_GLOBAL = /!\[[^\]]*\]\(([^)]+)\)/g;
const HEADING_REGEX_GLOBAL = /^#\s+(.+)$/gm;

export function getLatestReleasePreview(): MenuNavChildPreview | null {
  const notes = loadLocalReleaseNotes();
  const latest = notes[0];
  if (!latest) {
    return null;
  }

  const imageMatches = [...latest.content.matchAll(IMAGE_REGEX_GLOBAL)];
  const imageMatch = imageMatches.at(-1);

  const image = imageMatch?.[1];
  if (!image) {
    return null;
  }

  const imageIndex = imageMatch.index ?? latest.content.length;
  const headingMatches = [...latest.content.matchAll(HEADING_REGEX_GLOBAL)];
  const headingMatch = [...headingMatches]
    .reverse()
    .find((match) => (match.index ?? -1) < imageIndex);
  const featureTitle = headingMatch?.[1]?.trim();

  return {
    image,
    imageAlt: `Twenty release ${latest.release}${featureTitle ? ` — ${featureTitle}` : ''}`,
    imageScale: 1.04,
    title: `See what shipped in ${latest.release}`,
    description:
      'Track every release with changelogs, highlights and demos of the newest features.',
  };
}
