'use client';

import {
  ILLUSTRATIONS,
  type IllustrationId,
} from '@/illustrations/illustrations-registry';
import type { IllustrationProps } from '@/illustrations/types';

type IllustrationMountProps = { id: IllustrationId } & IllustrationProps;

export function IllustrationMount({ id, ...rest }: IllustrationMountProps) {
  const IllustrationComponent = ILLUSTRATIONS[id];

  return <IllustrationComponent {...rest} />;
}
