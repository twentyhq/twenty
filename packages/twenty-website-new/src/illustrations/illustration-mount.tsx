'use client';

import {
  ILLUSTRATIONS,
  type IllustrationId,
} from '@/illustrations/illustrations-registry';
import type { IllustrationProps } from '@/illustrations/types';

type IllustrationMountProps = {
  illustration: IllustrationId;
} & IllustrationProps;

export function IllustrationMount({
  illustration,
  ...rest
}: IllustrationMountProps) {
  const IllustrationComponent = ILLUSTRATIONS[illustration];

  return <IllustrationComponent {...rest} />;
}
