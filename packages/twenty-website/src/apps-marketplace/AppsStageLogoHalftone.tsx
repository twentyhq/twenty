'use client';

import { styled } from '@linaria/react';
import { useEffect, useMemo, useState } from 'react';

import { HalftoneImageBackdrop } from '@/platform/visuals/rigs/HalftoneImageBackdrop';
import { color, DURATION, EASING, REDUCED_MOTION } from '@/tokens';

import { APPS_STAGE_FEATURED_HALFTONE } from './apps-stage-featured-halftone';

// PROTOTYPE (?direction=e): an app's logo redrawn in Twenty's halftone. It
// prints in from the left once the rig has drawn its first frame, on mount
// (so again each time the parent remounts it for another app).
const Print = styled.div`
  height: 100%;
  mask-image: linear-gradient(90deg, ${color('black')} 40%, transparent 60%);
  mask-position: 100% 0;
  mask-repeat: no-repeat;
  mask-size: 250% 100%;
  position: relative;
  width: 100%;

  &[data-drawn] {
    animation: apps-stage-logo-print ${DURATION.xl} ${EASING.smooth} forwards;
  }

  @keyframes apps-stage-logo-print {
    to {
      mask-position: 0% 0;
    }
  }

  ${REDUCED_MOTION} {
    mask-image: none;

    &[data-drawn] {
      animation: none;
    }
  }
`;

// The halftone rig loads images without crossOrigin, so a remote logo would
// taint its WebGL texture. A same-origin blob copy avoids it; copies are kept
// for the page's life so a logo seen once starts drawing at once.
const sameOriginImages = new Map<string, Promise<string | undefined>>();

const loadSameOriginImage = (imageUrl: string) => {
  const cached = sameOriginImages.get(imageUrl);

  if (cached !== undefined) {
    return cached;
  }

  const pending = fetch(imageUrl)
    .then((response) => (response.ok ? response.blob() : undefined))
    .then((blob) =>
      blob === undefined ? undefined : URL.createObjectURL(blob),
    )
    .catch(() => undefined);

  sameOriginImages.set(imageUrl, pending);

  return pending;
};

const useSameOriginImage = (imageUrl: string) => {
  const [loaded, setLoaded] = useState<{ source: string; url: string }>();

  useEffect(() => {
    let isCurrent = true;

    void loadSameOriginImage(imageUrl).then((url) => {
      if (isCurrent && url !== undefined) {
        setLoaded({ source: imageUrl, url });
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [imageUrl]);

  return loaded !== undefined && loaded.source === imageUrl
    ? loaded.url
    : undefined;
};

type AppsStageLogoHalftoneProps = {
  logoUrl: string;
  // Camera distance: higher draws the logo smaller in its box.
  previewDistance?: number;
};

export function AppsStageLogoHalftone({
  logoUrl,
  previewDistance = APPS_STAGE_FEATURED_HALFTONE.previewDistance,
}: AppsStageLogoHalftoneProps) {
  const imageUrl = useSameOriginImage(logoUrl);
  const [isDrawn, setIsDrawn] = useState(false);
  // A stable settings object, so a re-render never restarts the rig.
  const settings = useMemo(
    () => ({ ...APPS_STAGE_FEATURED_HALFTONE, previewDistance }),
    [previewDistance],
  );

  return (
    <Print
      aria-hidden
      data-drawn={isDrawn ? '' : undefined}
      data-illustration="apps-logo-halftone"
    >
      {imageUrl !== undefined && (
        <HalftoneImageBackdrop
          imageUrl={imageUrl}
          onFirstFrame={() => setIsDrawn(true)}
          settings={settings}
        />
      )}
    </Print>
  );
}
