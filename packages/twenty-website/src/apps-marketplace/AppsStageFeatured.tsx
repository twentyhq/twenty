'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { useEffect, useState } from 'react';

import { ArrowUpRight } from '@/icons';
import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import { HalftoneImageBackdrop } from '@/platform/visuals/rigs/HalftoneImageBackdrop';
import {
  color,
  DURATION,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  REDUCED_MOTION,
  semanticColor,
  spacing,
} from '@/tokens';
import { Body, Heading, SectionShell } from '@/ui';

import { APPS_STAGE_CRAFT_COLUMN } from './apps-stage-craft-column';
import { APPS_STAGE_FEATURED_HALFTONE } from './apps-stage-featured-halftone';
import { type MarketplaceApp } from './marketplace-app';

// PROTOTYPE (?direction=e): a featured block after Profound's "Featured
// integrations": tabs of apps, one large panel with the app's logo redrawn in
// Twenty's halftone. Hand-picked (Jocelyn, 2026-11-19), matched on the name.
const FEATURED_APP_NAMES: readonly string[] = [
  'slack',
  'granola',
  'microsoft teams',
];

const Frame = styled.div`
  border-bottom: 1px solid ${semanticColor.line};
  border-inline: 1px solid ${semanticColor.line};
  padding: ${spacing(12)} ${spacing(4)};
  ${APPS_STAGE_CRAFT_COLUMN}

  & > * + * {
    margin-top: ${spacing(8)};
  }

  ${mediaUp('md')} {
    padding: ${spacing(20)} ${spacing(24)};
  }
`;

const Header = styled.div`
  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

const Tabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(2)};
`;

const Tab = styled.button`
  align-items: center;
  background-color: transparent;
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  color: ${semanticColor.inkMuted};
  cursor: pointer;
  display: flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  gap: ${spacing(2.5)};
  line-height: 20px;
  padding: ${spacing(2.5)} ${spacing(4)} ${spacing(2.5)} ${spacing(3)};
  transition:
    background-color ${DURATION.xxs} ${EASING.gentle},
    border-color ${DURATION.xxs} ${EASING.gentle},
    color ${DURATION.xxs} ${EASING.gentle};

  &:hover {
    color: ${semanticColor.ink};
  }

  &[aria-selected='true'] {
    background-color: ${color('white-5')};
    border-color: ${semanticColor.lineStrong};
    color: ${semanticColor.ink};
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 2px;
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

const TabLogo = styled.img`
  border-radius: ${radius(1)};
  height: 20px;
  object-fit: contain;
  width: 20px;
`;

const Panel = styled.div`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  overflow: hidden;
  display: grid;
  min-height: 340px;
  position: relative;

  ${mediaUp('md')} {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
`;

// Rekeyed per app, so a switch fades the new content in.
const PanelText = styled.div`
  animation: apps-stage-featured-in ${DURATION.md} ${EASING.gentle} backwards;
  display: flex;
  flex-direction: column;
  gap: ${spacing(12)};
  justify-content: space-between;
  padding: ${spacing(6)};
  position: relative;
  z-index: 1;

  ${mediaUp('md')} {
    padding: ${spacing(9)};
  }

  @keyframes apps-stage-featured-in {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

const LogoTile = styled.div`
  align-items: center;
  background-color: ${color('white')};
  border-radius: ${radius(2)};
  display: flex;
  height: 56px;
  justify-content: center;
  overflow: hidden;
  width: 56px;
`;

const Logo = styled.img`
  height: 34px;
  object-fit: contain;
  width: 34px;
`;

const Text = styled.div`
  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

const AppName = styled.h3`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(5.5)};
  font-weight: ${FONT_WEIGHT.medium};
  line-height: 28px;
`;

// Clamped to four lines and always four lines tall, so every app's panel is
// the same size and switching tabs never moves the page.
const Tagline = styled.p`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  color: ${semanticColor.inkMuted};
  display: -webkit-box;
  min-height: calc(26px * 4);
  overflow: hidden;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  line-height: 26px;
  max-width: 440px;
`;

const AppLink = styled(LocalizedLink)`
  align-items: center;
  color: ${semanticColor.ink};
  display: inline-flex;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  gap: ${spacing(1.5)};
  letter-spacing: 0.08em;
  text-decoration: none;
  text-transform: uppercase;

  & > svg {
    transition: transform ${DURATION.xs} ${EASING.standard};
  }

  &:hover > svg {
    transform: translate(2px, -2px);
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 4px;
  }

  ${REDUCED_MOTION} {
    & > svg {
      transition: none;
    }
  }
`;

// The logo prints in from the left once the rig has drawn its first frame:
// on page load and again on every tab change (the visual remounts per app).
const Visual = styled.div`
  height: 260px;
  mask-image: linear-gradient(90deg, ${color('black')} 40%, transparent 60%);
  mask-position: 100% 0;
  mask-repeat: no-repeat;
  mask-size: 250% 100%;
  position: relative;

  &[data-drawn] {
    animation: apps-stage-featured-print ${DURATION.xl} ${EASING.smooth}
      forwards;
  }

  @keyframes apps-stage-featured-print {
    to {
      mask-position: 0% 0;
    }
  }

  ${mediaUp('md')} {
    height: auto;
  }

  ${REDUCED_MOTION} {
    mask-image: none;

    &[data-drawn] {
      animation: none;
    }
  }
`;

type FeaturedVisualProps = {
  imageUrl: string;
};

function FeaturedVisual({ imageUrl }: FeaturedVisualProps) {
  const [isDrawn, setIsDrawn] = useState(false);

  return (
    <Visual
      aria-hidden
      data-drawn={isDrawn ? '' : undefined}
      data-illustration="apps-featured"
    >
      <HalftoneImageBackdrop
        imageUrl={imageUrl}
        onFirstFrame={() => setIsDrawn(true)}
        settings={APPS_STAGE_FEATURED_HALFTONE}
      />
    </Visual>
  );
}

// The halftone rig loads images without crossOrigin, so a remote logo would
// taint its WebGL texture. A same-origin blob copy avoids it; copies are kept
// for the page's life so switching back to a tab starts drawing at once.
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

const useSameOriginImage = (imageUrl: string | undefined) => {
  const [loaded, setLoaded] = useState<{ source: string; url: string }>();

  useEffect(() => {
    if (imageUrl === undefined) {
      return;
    }

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

type AppsStageFeaturedProps = {
  apps: readonly MarketplaceApp[];
};

export function AppsStageFeatured({ apps }: AppsStageFeaturedProps) {
  const { i18n } = useLingui();
  const featured = FEATURED_APP_NAMES.flatMap((name) => {
    const app = apps.find(
      (candidate) => candidate.name.trim().toLowerCase() === name,
    );

    return app === undefined ? [] : [app];
  });
  const [activeSlug, setActiveSlug] = useState<string | undefined>(
    featured[0]?.slug,
  );
  const active = featured.find((app) => app.slug === activeSlug) ?? featured[0];
  const visualUrl = useSameOriginImage(active?.logoUrl);

  if (active === undefined) {
    return null;
  }

  const panelId = 'apps-stage-featured-panel';

  return (
    <SectionShell flushInline rhythm="flush" scheme="dark">
      <Frame>
        <Header>
          <Heading as="h2" size="sm" weight="light">
            {i18n._(msg`Featured apps`)}
          </Heading>
          <Body muted size="sm">
            {i18n._(msg`Picked by the Twenty team.`)}
          </Body>
        </Header>
        <Tabs aria-label={i18n._(msg`Featured apps`)} role="tablist">
          {featured.map((app) => (
            <Tab
              aria-controls={panelId}
              aria-selected={app.slug === active.slug}
              key={app.slug}
              onClick={() => setActiveSlug(app.slug)}
              role="tab"
              type="button"
            >
              {app.logoUrl !== undefined && (
                <TabLogo alt="" src={app.logoUrl} />
              )}
              {app.name}
            </Tab>
          ))}
        </Tabs>
        <Panel id={panelId} role="tabpanel">
          <PanelText key={`text-${active.slug}`}>
            <LogoTile>
              {active.logoUrl !== undefined && (
                <Logo alt="" src={active.logoUrl} />
              )}
            </LogoTile>
            <Text>
              <AppName>{active.name}</AppName>
              <Tagline>{active.tagline}</Tagline>
              <AppLink href={`/apps/${active.slug}`}>
                {i18n._(msg`View app`)}
                <ArrowUpRight />
              </AppLink>
            </Text>
          </PanelText>
          {visualUrl !== undefined && (
            <FeaturedVisual
              imageUrl={visualUrl}
              key={`visual-${active.slug}`}
            />
          )}
        </Panel>
      </Frame>
    </SectionShell>
  );
}
