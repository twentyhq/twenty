import { loadLocalReleaseNotes } from '@/lib/releases/load-local-release-notes';
import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export type LatestReleasePreview = {
  image: string;
  imageAlt: string;
  imageScale?: number;
  title: MessageDescriptor;
  description: MessageDescriptor;
};

export function getLatestReleasePreview(): LatestReleasePreview | null {
  const notes = loadLocalReleaseNotes();
  const latest = notes[0];
  if (!latest) {
    return null;
  }

  return {
    image: latest.previewImage,
    imageAlt: `Twenty release ${latest.release} — ${latest.title}`,
    imageScale: 1.04,
    title: msg`See what shipped in ${latest.release}`,
    description: msg`Track every release with changelogs, highlights and demos of the newest features.`,
  };
}
