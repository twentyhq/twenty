'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { type CSSProperties } from 'react';

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

import { type AppsStageLogoInk } from './apps-stage-logo-ink';
import { type MarketplaceApp } from './marketplace-app';

// PROTOTYPE (?direction=e): one bordered cell of the catalogue grid. Logo top
// left, category and Beta top right, name and tagline at the bottom.
const Cell = styled.article`
  /* backwards, not both: once in, opacity is free for the hover fade. */
  animation: apps-stage-craft-cell-in ${DURATION.sm} ${EASING.standard}
    backwards;
  animation-delay: calc(var(--apps-stage-cell-index) * 40ms);
  border-bottom: 1px solid ${semanticColor.line};
  border-right: 1px solid ${semanticColor.line};
  display: flex;
  flex-direction: column;
  gap: ${spacing(8)};
  justify-content: space-between;
  min-height: 188px;
  padding: ${spacing(6)};
  position: relative;
  transition:
    background-color ${DURATION.xxs} ${EASING.gentle},
    opacity ${DURATION.xs} ${EASING.gentle};

  ${mediaUp('md')} {
    min-height: 220px;
    padding: ${spacing(7)};
  }

  &:hover,
  &:focus-within {
    background-color: ${color('white-5')};
  }

  @keyframes apps-stage-craft-cell-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
    transition: none;
  }
`;

const Top = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${spacing(3)};
  justify-content: space-between;
`;

const LogoTile = styled.div`
  align-items: center;
  background-color: ${color('white')};
  border-radius: ${radius(2)};
  display: flex;
  flex-shrink: 0;
  height: 40px;
  justify-content: center;
  overflow: hidden;
  width: 40px;
`;

const Logo = styled.img`
  height: 24px;
  object-fit: contain;
  width: 24px;

  &[data-kind='plate'] {
    height: 40px;
    object-fit: cover;
    width: 40px;
  }
`;

const Labels = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(2)};
  justify-content: flex-end;
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
  padding: 3px ${spacing(1.5)};
`;

// Pastel text on a tint of the same hue, as the brief asks for categories.
const CategoryLabel = styled(MonoLabel)`
  background-color: color-mix(
    in srgb,
    var(--apps-stage-pastel) 12%,
    transparent
  );
  border-radius: ${radius(1)};
  color: var(--apps-stage-pastel);
  padding: 4px ${spacing(1.5)};
`;

const Text = styled.div`
  & > * + * {
    margin-top: ${spacing(1.5)};
  }
`;

const AppName = styled.h3`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4.25)};
  font-weight: ${FONT_WEIGHT.medium};
  line-height: 22px;
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

const Tagline = styled.p`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  color: ${semanticColor.inkMuted};
  display: -webkit-box;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  line-height: 20px;
  overflow: hidden;
`;

type CellStyle = CSSProperties & {
  '--apps-stage-cell-index': number;
  '--apps-stage-pastel': string;
};

type AppsStageCraftCellProps = {
  app: MarketplaceApp;
  index: number;
  ink?: AppsStageLogoInk;
  isBeta: boolean;
  pastel: string;
};

export function AppsStageCraftCell({
  app,
  index,
  ink,
  isBeta,
  pastel,
}: AppsStageCraftCellProps) {
  const { i18n } = useLingui();
  const headingId = `apps-stage-craft-cell-${app.slug}`;
  const style: CellStyle = {
    '--apps-stage-cell-index': index,
    '--apps-stage-pastel': pastel,
  };

  return (
    <Cell aria-labelledby={headingId} data-apps-stage-cell="" style={style}>
      <Top>
        <LogoTile>
          {app.logoUrl !== undefined && app.logoUrl.length > 0 && (
            <Logo alt="" data-kind={ink?.kind} src={app.logoUrl} />
          )}
        </LogoTile>
        <Labels>
          {isBeta && <BetaLabel>{i18n._(msg`Beta`)}</BetaLabel>}
          {app.category.length > 0 && (
            <CategoryLabel>{app.category}</CategoryLabel>
          )}
        </Labels>
      </Top>
      <Text>
        <AppName id={headingId}>
          <NameLink href={`/apps/${app.slug}`}>{app.name}</NameLink>
        </AppName>
        <Tagline>{app.tagline}</Tagline>
      </Text>
    </Cell>
  );
}
