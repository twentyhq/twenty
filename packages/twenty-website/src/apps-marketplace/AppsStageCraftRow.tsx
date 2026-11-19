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

import { AppsStageAppIcon } from './AppsStageAppIcon';
import { type MarketplaceApp } from './marketplace-app';

// PROTOTYPE (?direction=e&view=list): one app per row, like Raycast's store.
// A list scans faster than a grid of tall cards and shows every app at once.
const Row = styled(LocalizedLink)`
  align-items: center;
  animation: apps-stage-craft-row-in ${DURATION.sm} ${EASING.standard} backwards;
  animation-delay: calc(var(--apps-stage-row-index) * 30ms);
  border-radius: ${radius(2)};
  color: inherit;
  display: grid;
  gap: ${spacing(4)};
  grid-template-columns: auto minmax(0, 1fr) auto;
  isolation: isolate;
  overflow: hidden;
  padding: ${spacing(3)};
  position: relative;
  text-decoration: none;

  /* The site's hover: a fill slides in from the left. */
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
    outline-offset: -1px;
  }

  @keyframes apps-stage-craft-row-in {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
  }

  ${REDUCED_MOTION} {
    animation: none;

    &::before {
      transition: none;
    }
  }
`;

const Text = styled.span`
  min-width: 0;
`;

const NameLine = styled.span`
  align-items: center;
  display: flex;
  gap: ${spacing(2)};
`;

const Name = styled.span`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.75)};
  font-weight: ${FONT_WEIGHT.medium};
  line-height: 20px;
`;

const Tagline = styled.span`
  color: ${semanticColor.inkMuted};
  display: block;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MonoLabel = styled.span`
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.5)};
  letter-spacing: 0.08em;
  line-height: 12px;
  text-transform: uppercase;
`;

const BetaLabel = styled(MonoLabel)`
  border: 1px solid color-mix(in srgb, ${color('yellow')} 32%, transparent);
  border-radius: ${radius(1)};
  color: ${color('yellow')};
  padding: 2px ${spacing(1.5)};
`;

const End = styled.span`
  align-items: center;
  color: ${semanticColor.inkSubtle};
  display: flex;
  gap: ${spacing(4)};
`;

const Author = styled.span`
  display: none;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.25)};

  ${mediaUp('md')} {
    display: block;
  }
`;

const Arrow = styled.span`
  display: flex;
  transition:
    color ${DURATION.xxs} ${EASING.gentle},
    transform ${DURATION.xs} ${EASING.standard};

  ${Row}:is(:hover, :focus-visible) & {
    color: ${semanticColor.ink};
    transform: translate(2px, -2px);
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

type RowStyle = CSSProperties & { '--apps-stage-row-index': number };

type AppsStageCraftRowProps = {
  app: MarketplaceApp;
  index: number;
  isBeta: boolean;
};

export function AppsStageCraftRow({
  app,
  index,
  isBeta,
}: AppsStageCraftRowProps) {
  const { i18n } = useLingui();
  const style: RowStyle = { '--apps-stage-row-index': index };

  return (
    <li>
      <Row
        data-apps-stage-cell=""
        href={`/apps/${app.slug}?direction=e`}
        style={style}
      >
        <AppsStageAppIcon app={app} sizePx={40} />
        <Text>
          <NameLine>
            <Name>{app.name}</Name>
            {isBeta && <BetaLabel>{i18n._(msg`Beta`)}</BetaLabel>}
          </NameLine>
          <Tagline>{app.tagline}</Tagline>
        </Text>
        <End>
          <Author>{i18n._(msg`By ${app.author}`)}</Author>
          <Arrow aria-hidden>
            <ArrowUpRight />
          </Arrow>
        </End>
      </Row>
    </li>
  );
}
