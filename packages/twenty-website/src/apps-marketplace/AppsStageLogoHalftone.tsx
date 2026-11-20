'use client';

import { styled } from '@linaria/react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { HalftoneImageBackdrop } from '@/platform/visuals/rigs/HalftoneImageBackdrop';
import { color, DURATION, EASING, REDUCED_MOTION } from '@/tokens';

import { APPS_STAGE_FEATURED_HALFTONE } from './apps-stage-featured-halftone';

// An app's logo redrawn in Twenty's halftone, printing in from the left once
// drawn. The site allows six WebGL contexts at once and a catalogue shows
// more logos than that, so a logo keeps its frame as a still image and hands
// its context to the next one, unless it is live (pointer light).
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

// Same frame as the rig, so nothing jumps when the halftone takes over: the
// logo centred, its height 4 / previewDistance of the box (contain fit at
// the rig's reference distance of 4), its width from its own ratio.
const Poster = styled.div`
  inset: 0;
  position: absolute;
  /* Only reduced motion keeps the plain logo: elsewhere the band waits
     empty, then prints in, rather than showing one logo turn into another. */
  visibility: hidden;

  ${REDUCED_MOTION} {
    visibility: visible;
  }

  & > img {
    filter: grayscale(1);
    height: var(--apps-stage-poster-size);
    left: 50%;
    max-width: 100%;
    opacity: 0.16;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: auto;
  }
`;

const Still = styled.img`
  display: block;
  height: 100%;
  width: 100%;
`;

const RIG_REFERENCE_DISTANCE = 4;

// Kept for the page's life, so a logo drawn once shows at once afterwards.
const stills = new Map<string, string>();

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
  // Keeps its WebGL context for the pointer light; for a few logos only.
  isLive?: boolean;
  logoUrl: string;
  // Camera distance: higher draws the logo smaller in its box.
  previewDistance?: number;
};

export function AppsStageLogoHalftone({
  isLive = false,
  logoUrl,
  previewDistance = APPS_STAGE_FEATURED_HALFTONE.previewDistance,
}: AppsStageLogoHalftoneProps) {
  const imageUrl = useSameOriginImage(logoUrl);
  const printRef = useRef<HTMLDivElement>(null);
  const stillKey = `${logoUrl}|${previewDistance}`;
  const [still, setStill] = useState(() =>
    isLive ? undefined : stills.get(stillKey),
  );
  const [isDrawn, setIsDrawn] = useState(still !== undefined);

  // The drawing buffer is only readable in the task that rendered it, which
  // is the one this callback runs in.
  const handleFirstFrame = () => {
    setIsDrawn(true);

    if (isLive) {
      return;
    }

    const frame = printRef.current?.querySelector('canvas')?.toDataURL();

    if (frame !== undefined) {
      stills.set(stillKey, frame);
      setStill(frame);
    }
  };
  // A stable settings object, so a re-render never restarts the rig.
  const settings = useMemo(
    () => ({ ...APPS_STAGE_FEATURED_HALFTONE, previewDistance }),
    [previewDistance],
  );

  const poster = (
    <Poster
      style={{
        ['--apps-stage-poster-size' as string]: `${Math.round(
          (RIG_REFERENCE_DISTANCE / previewDistance) * 100,
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
      ref={printRef}
    >
      {still !== undefined ? (
        <Still alt="" src={still} />
      ) : imageUrl === undefined ? (
        poster
      ) : (
        <HalftoneImageBackdrop
          imageUrl={imageUrl}
          onFirstFrame={handleFirstFrame}
          poster={poster}
          settings={settings}
        />
      )}
    </Print>
  );
}
