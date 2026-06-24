import { type MessageDescriptor } from '@lingui/core';
import { type ReactNode } from 'react';

// A release note is structured data, not markdown: each highlight is a titled
// paragraph with an optional image. The title is a plain Lingui descriptor; the
// description is a <Trans> phrase so inline <code>/<strong> survive without
// putting markup in the translatable string. No MDX runtime (worker-safe) and
// Crowdin sees clean full-phrase messages.
export type ReleaseHighlight = {
  title: MessageDescriptor;
  description: ReactNode;
  image?: string;
};

export type ReleaseNote = {
  release: string;
  date: string;
  highlights: ReleaseHighlight[];
};
