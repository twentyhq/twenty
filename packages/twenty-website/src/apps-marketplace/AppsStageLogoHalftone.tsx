'use client';

import { styled } from '@linaria/react';
import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { isDefined } from 'twenty-shared/utils';

import { HalftoneImageBackdrop } from '@/platform/visuals/rigs/HalftoneImageBackdrop';
import { color, DURATION, EASING, REDUCED_MOTION } from '@/tokens';

import { APPS_STAGE_FEATURED_HALFTONE } from './apps-stage-featured-halftone';

// The site allows six WebGL contexts; a non-live logo keeps its frame as a still and lets go.
const Print = styled.div`
  height: 100%;
  position: relative;
  width: 100%;

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

// Sized like the rig's contain fit at its reference distance, so nothing jumps.
const Poster = styled.div`
  inset: 0;
  position: absolute;
  /* Reduced motion keeps the plain logo; elsewhere the band waits empty. */
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

type PosterStyle = CSSProperties & { '--apps-stage-poster-size': string };

// Kept for the page's life, so a logo drawn once shows at once afterwards.
const stills = new Map<string, string>();

// The rig loads images without crossOrigin: a same-origin blob keeps the texture untainted.
const sameOriginImages = new Map<string, Promise<string | undefined>>();

const loadSameOriginImage = (imageUrl: string) => {
  const cached = sameOriginImages.get(imageUrl);

  if (isDefined(cached)) {
    return cached;
  }

  const pending = fetch(imageUrl)
    .then((response) => (response.ok ? response.blob() : undefined))
    .then((blob) => (isDefined(blob) ? URL.createObjectURL(blob) : undefined))
    .catch(() => undefined);

  sameOriginImages.set(imageUrl, pending);

  return pending;
};

const useSameOriginImage = (imageUrl: string) => {
  const [loaded, setLoaded] = useState<{ source: string; url: string }>();

  useEffect(() => {
    let isCurrent = true;

    void loadSameOriginImage(imageUrl).then((url) => {
      if (isCurrent && isDefined(url)) {
        setLoaded({ source: imageUrl, url });
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [imageUrl]);

  return isDefined(loaded) && loaded.source === imageUrl
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
  const [isDrawn, setIsDrawn] = useState(isDefined(still));

  // The drawing buffer is only readable in the task that rendered it.
  const handleFirstFrame = () => {
    setIsDrawn(true);

    if (isLive) {
      return;
    }

    const frame = printRef.current?.querySelector('canvas')?.toDataURL();

    if (isDefined(frame)) {
      stills.set(stillKey, frame);
      setStill(frame);
    }
  };
  // A stable settings object, so a re-render never restarts the rig.
  const settings = useMemo(
    () => ({ ...APPS_STAGE_FEATURED_HALFTONE, previewDistance }),
    [previewDistance],
  );

  const posterStyle: PosterStyle = {
    '--apps-stage-poster-size': `${Math.round(
      (RIG_REFERENCE_DISTANCE / previewDistance) * 100,
    )}%`,
  };

  const poster = (
    <Poster style={posterStyle}>
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
      {isDefined(still) ? (
        <Still alt="" src={still} />
      ) : isDefined(imageUrl) ? (
        <HalftoneImageBackdrop
          imageUrl={imageUrl}
          onFirstFrame={handleFirstFrame}
          poster={poster}
          settings={settings}
        />
      ) : (
        poster
      )}
    </Print>
  );
}
