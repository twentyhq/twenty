'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { useState } from 'react';

import { ArrowUpRight } from '@/icons';
import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
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
import { AppsStageLogoHalftone } from './AppsStageLogoHalftone';
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
`;

// The whole panel is the link to the app's page. On hover it answers like
// the site's buttons: a fill slides in from the left, the logo springs up and
// an arrow comes in.
const PanelLink = styled(LocalizedLink)`
  color: inherit;
  display: grid;
  isolation: isolate;

  position: relative;
  text-decoration: none;

  &::before {
    background-color: ${color('white-5')};
    content: '';
    inset: 0;
    position: absolute;
    transform: translateX(-101%);
    transition: transform ${DURATION.md} ${EASING.standard};
    z-index: -1;
  }

  &:is(:hover, :focus-visible)::before {
    transform: translateX(0);
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: -2px;
  }

  ${mediaUp('md')} {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  ${REDUCED_MOTION} {
    &::before {
      transition: none;
    }
  }
`;

const HoverArrow = styled.span`
  color: ${semanticColor.ink};
  display: flex;
  opacity: 0;
  position: absolute;
  right: ${spacing(6)};
  top: ${spacing(6)};
  transform: translate(-6px, 6px);
  transition:
    opacity ${DURATION.xs} ${EASING.gentle},
    transform ${DURATION.md} ${EASING.spring};
  z-index: 1;

  ${PanelLink}:is(:hover, :focus-visible) & {
    opacity: 1;
    transform: translate(0, 0);
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

// Rekeyed per app, so a switch fades the new content in.
const PanelText = styled.div`
  animation: apps-stage-featured-in ${DURATION.md} ${EASING.gentle} backwards;
  display: flex;
  flex-direction: column;
  gap: ${spacing(5)};
  padding: ${spacing(6)};
  position: relative;
  z-index: 1;

  ${mediaUp('md')} {
    padding: ${spacing(8)};
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

  transition: transform ${DURATION.md} ${EASING.spring};

  ${PanelLink}:is(:hover, :focus-visible) & {
    transform: scale(1.06);
  }

  ${PanelLink}:active & {
    transform: scale(0.97);
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
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

// The halftone logo is decoration: it takes the panel's right half from md,
// and is left out below, where it would only push the text apart.
const Visual = styled.div`
  display: none;

  ${mediaUp('md')} {
    display: block;
    height: 240px;
    margin-block: auto;
  }
`;

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
          <PanelLink href={`/apps/${active.slug}?direction=e`}>
            <HoverArrow aria-hidden>
              <ArrowUpRight />
            </HoverArrow>
            <PanelText key={`text-${active.slug}`}>
              <LogoTile>
                {active.logoUrl !== undefined && (
                  <Logo alt="" src={active.logoUrl} />
                )}
              </LogoTile>
              <Text>
                <AppName>{active.name}</AppName>
                <Tagline>{active.tagline}</Tagline>
              </Text>
            </PanelText>
            {active.logoUrl !== undefined && (
              <Visual key={`visual-${active.slug}`}>
                <AppsStageLogoHalftone logoUrl={active.logoUrl} />
              </Visual>
            )}
          </PanelLink>
        </Panel>
      </Frame>
    </SectionShell>
  );
}
