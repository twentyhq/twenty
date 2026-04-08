'use client';

import {
  ILLUSTRATIONS,
  type IllustrationId,
} from '@/illustrations/illustrations-registry';

type IllustrationMountProps = {
  illustration: IllustrationId;
};

export function IllustrationMount({ illustration }: IllustrationMountProps) {
  const IllustrationComponent = ILLUSTRATIONS[illustration];

  return <IllustrationComponent />;
}
