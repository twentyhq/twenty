'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { type CSSProperties } from 'react';

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

import { AppsStageLogoTile } from './AppsStageLogoTile';
import { type AppsStageLogoInk } from './apps-stage-logo-ink';
import { type MarketplaceApp } from './marketplace-app';

// PROTOTYPE (?direction=d): one cell of the catalogue sheet. Flat and dark;
// on hover the app's own colour lights the cell from its logo.
const Cell = styled.article`
  --apps-stage-tint: ${color('white')};
  --apps-stage-tile-size: 56px;
  animation: apps-stage-cell-enter ${DURATION.xl} ${EASING.standard} both;
  animation-delay: calc(var(--apps-stage-cell-index) * 55ms + 80ms);
  background-color: ${semanticColor.surface};
  display: flex;
  gap: ${spacing(5)};
  isolation: isolate;
  min-height: 100%;
  padding: ${spacing(6)} ${spacing(5)};
  position: relative;
  transition: background-color ${DURATION.xxs} ${EASING.gentle};

  ${mediaUp('md')} {
    --apps-stage-tile-size: 64px;
    gap: ${spacing(6)};
    padding: ${spacing(8)};
  }

  /* The light: a wash of the logo's colour, strongest behind the logo. */
  &::before {
    background: radial-gradient(
      ellipse 70% 120% at 0% 0%,
      color-mix(in srgb, var(--apps-stage-tint) 20%, transparent),
      transparent 70%
    );
    content: '';
    inset: 0;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    transition: opacity ${DURATION.md} ${EASING.gentle};
    z-index: -1;
  }

  &:hover,
  &:focus-within {
    background-color: ${color('charcoal')};
  }

  &:hover::before,
  &:focus-within::before {
    opacity: 1;
  }

  &:active {
    background-color: ${color('black')};
  }

  @keyframes apps-stage-cell-enter {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
    transition: none;

    &::before {
      transition: none;
    }
  }
`;

const LogoBox = styled.div`
  flex-shrink: 0;
  height: var(--apps-stage-tile-size);
  transition: transform ${DURATION.md} ${EASING.spring};
  width: var(--apps-stage-tile-size);

  ${Cell}:hover & {
    transform: scale(1.06);
  }

  ${Cell}:active & {
    transform: scale(0.97);
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

const Text = styled.div`
  display: flex;
  flex: 1 1 0%;
  flex-direction: column;
  min-width: 0;

  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

const NameRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${spacing(2.5)};
  padding-right: ${spacing(8)};
`;

const AppName = styled.h3`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4.5)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: -0.02em;
  line-height: 1.25;
`;

// The whole cell is the link's hit area.
const NameLink = styled(LocalizedLink)`
  color: inherit;
  text-decoration: none;

  &::after {
    content: '';
    inset: 0;
    position: absolute;
  }

  &:focus-visible::after {
    outline: 1px solid ${color('blue')};
    outline-offset: -1px;
  }
`;

const BetaLabel = styled.span`
  border: 1px solid ${semanticColor.lineStrong};
  border-radius: ${radius(1)};
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.5)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.08em;
  line-height: 1;
  padding: ${spacing(1)} ${spacing(1.5)};
  text-transform: uppercase;
`;

const Tagline = styled.p`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  color: ${semanticColor.inkMuted};
  display: -webkit-box;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.75)};
  line-height: 1.5;
  overflow: hidden;
`;

const Meta = styled.p`
  color: ${semanticColor.inkSubtle};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.75)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.06em;
  padding-top: ${spacing(1.5)};
  text-transform: uppercase;

  & > span + span::before {
    content: '·';
    padding-inline: ${spacing(2)};
  }
`;

const Arrow = styled.span`
  color: ${semanticColor.inkSubtle};
  display: flex;
  position: absolute;
  right: ${spacing(5)};
  top: ${spacing(6)};
  transition:
    color ${DURATION.xxs} ${EASING.gentle},
    transform ${DURATION.xs} ${EASING.standard};

  ${mediaUp('md')} {
    right: ${spacing(8)};
    top: ${spacing(8)};
  }

  ${Cell}:hover &, ${Cell}:focus-within & {
    color: ${semanticColor.ink};
    transform: translate(3px, -3px);
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

type CellStyle = CSSProperties & {
  '--apps-stage-cell-index': number;
  '--apps-stage-tint'?: string;
};

type AppsStageCardProps = {
  app: MarketplaceApp;
  index: number;
  ink?: AppsStageLogoInk;
  isBeta: boolean;
};

export function AppsStageCard({ app, index, ink, isBeta }: AppsStageCardProps) {
  const { i18n } = useLingui();
  const headingId = `apps-stage-card-${app.slug}`;
  const style: CellStyle = {
    '--apps-stage-cell-index': index,
    ...(ink !== undefined && ink.tint.length > 0
      ? { '--apps-stage-tint': ink.tint }
      : {}),
  };

  return (
    <Cell aria-labelledby={headingId} data-apps-stage-cell="" style={style}>
      <LogoBox>
        <AppsStageLogoTile ink={ink} logoUrl={app.logoUrl} name={app.name} />
      </LogoBox>
      <Text>
        <NameRow>
          <AppName id={headingId}>
            <NameLink href={`/apps/${app.slug}`}>{app.name}</NameLink>
          </AppName>
          {isBeta && <BetaLabel>{i18n._(msg`Beta`)}</BetaLabel>}
        </NameRow>
        <Tagline>{app.tagline}</Tagline>
        <Meta>
          {app.category.length > 0 && <span>{app.category}</span>}
          <span>{i18n._(msg`By ${app.author}`)}</span>
        </Meta>
      </Text>
      <Arrow aria-hidden>
        <ArrowUpRight />
      </Arrow>
    </Cell>
  );
}
