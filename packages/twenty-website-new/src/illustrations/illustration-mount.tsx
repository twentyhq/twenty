'use client';

import { VisibleWhenTabActive } from '@/components/VisibleWhenTabActive';
import { WebGlWhenInViewport } from '@/components/WebGlWhenInViewport';
import {
  ILLUSTRATIONS,
  type IllustrationId,
} from '@/illustrations/illustrations-registry';

type IllustrationMountProps = {
  illustration: IllustrationId;
};

export function IllustrationMount({ illustration }: IllustrationMountProps) {
  const IllustrationComponent = ILLUSTRATIONS[illustration];
  const detachWebGlGateFromLayout = illustration === 'footerBackground';

  return (
    <VisibleWhenTabActive>
      <WebGlWhenInViewport detachFromLayout={detachWebGlGateFromLayout}>
        <IllustrationComponent />
      </WebGlWhenInViewport>
    </VisibleWhenTabActive>
  );
}
