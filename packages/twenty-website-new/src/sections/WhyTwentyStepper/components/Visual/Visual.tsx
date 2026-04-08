'use client';

import { IllustrationMount, type IllustrationId } from '@/illustrations';

type VisualProps = {
  illustration: IllustrationId;
};

export function Visual({ illustration }: VisualProps) {
  return <IllustrationMount id={illustration} />;
}
