'use client';

import { styled } from '@linaria/react';
import { useEffect, useMemo, useState } from 'react';

import { HalftoneImageBackdrop } from '@/platform/visuals/rigs/HalftoneImageBackdrop';
import { color, DURATION, EASING, REDUCED_MOTION } from '@/tokens';

import { APPS_STAGE_FEATURED_HALFTONE } from './apps-stage-featured-halftone';

// PROTOTYPE (?direction=e): an app's logo redrawn in Twenty's halftone. It
// prints in from the left once the rig has drawn its first frame. Until the
// rig has a WebGL slot (the site allows six at once), the plain logo stands
// in, greyed, at the same size.
const Print = styled.div`
  height: 100%;
  position: relative;
  width: 100%;

  /* The print mask only applies once the halftone draws, so the poster
     before it shows whole. */
  &[data-drawn] {
    animation: apps-stage-logo-print ${DURATION.xl} ${EASING.smooth} forwards;
    mask-image: linear-gradient(90deg, ${color('black')} 40%, transparent 60%);
    mask-position: 100% 0;
    mask-repeat: no-repeat;
    mask-size: 250% 100%;
  }

  @keyframes apps-stage-logo-print {
    to {
      mask-position: 0% 0;
    }
  }

  ${REDUCED_MOTION} {
    &[data-drawn] {
      animation: none;
      mask-image: none;
    }
  }
`;

const Poster = styled.div`
  display: grid;
  inset: 0;
  place-items: center;
  position: absolute;

  & > img {
    filter: grayscale(1);
    height: var(--apps-stage-poster-size);
    object-fit: contain;
    opacity: 0.16;
    width: var(--apps-stage-poster-size);
  }
`;

// A little under the rig's own footprint (about 4 / previewDistance of the
// box height), so the stand-in never reads larger than the halftone.
const POSTER_SCALE = 3.4;

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

  const poster = (
    <Poster
      style={{
        ['--apps-stage-poster-size' as string]: `${Math.round(
          (POSTER_SCALE / previewDistance) * 100,
        )}%`,
      }}
    >
      <img alt="" src={logoUrl} />
    </Poster>
  );

  return (
    <Print
      aria-hidden
      data-drawn={isDrawn ? '' : undefined}
      data-illustration="apps-logo-halftone"
    >
      {imageUrl === undefined ? (
        poster
      ) : (
        <HalftoneImageBackdrop
          imageUrl={imageUrl}
          onFirstFrame={() => setIsDrawn(true)}
          poster={poster}
          settings={settings}
        />
      )}
    </Print>
  );
}
