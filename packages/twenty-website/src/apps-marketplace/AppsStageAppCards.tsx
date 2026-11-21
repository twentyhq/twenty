'use client';

import { styled } from '@linaria/react';
import { type CSSProperties } from 'react';
import { isDefined } from 'twenty-shared/utils';

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
import { AppsStageLogoHalftone } from './AppsStageLogoHalftone';
import { type MarketplaceApp } from './marketplace-app';

const Cards = styled.ul`
  display: grid;
  gap: ${spacing(3)};
  grid-template-columns: minmax(0, 1fr);
  list-style: none;
  padding: 0;

  ${mediaUp('sm')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${mediaUp('md')} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const Card = styled(LocalizedLink)`
  animation: apps-stage-featured-in ${DURATION.xl} ${EASING.standard} backwards;
  animation-delay: calc(var(--apps-stage-card-index) * 80ms);
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  color: inherit;
  display: flex;
  flex-direction: column;
  height: 100%;
  isolation: isolate;
  overflow: hidden;
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

  @keyframes apps-stage-featured-in {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
  }

  ${REDUCED_MOTION} {
    animation: none;

    &::before {
      transition: none;
    }
  }
`;

const Visual = styled.div`
  border-bottom: 1px solid ${semanticColor.line};
  display: none;
  height: 180px;

  ${mediaUp('md')} {
    display: block;
  }
`;

const Content = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: ${spacing(4)};
  padding: ${spacing(6)};
`;

const Top = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const Text = styled.div`
  & > * + * {
    margin-top: ${spacing(1.5)};
  }
`;

const AppName = styled.h3`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4.5)};
  font-weight: ${FONT_WEIGHT.medium};
  line-height: 24px;
`;

const Tagline = styled.p`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  color: ${semanticColor.inkMuted};
  display: -webkit-box;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  line-height: 22px;
  overflow: hidden;
`;

type CardStyle = CSSProperties & { '--apps-stage-card-index': number };

type AppsStageAppCardsProps = {
  apps: readonly MarketplaceApp[];
  // For a short row only: each live logo holds one of six WebGL contexts.
  hasLiveLogos?: boolean;
};

export function AppsStageAppCards({
  apps,
  hasLiveLogos = false,
}: AppsStageAppCardsProps) {
  return (
    <Cards>
      {apps.map((app, index) => {
        const style: CardStyle = { '--apps-stage-card-index': index };

        return (
          <li key={app.slug}>
            <Card
              data-apps-stage-cell=""
              href={`/apps/${app.slug}`}
              style={style}
            >
              {isDefined(app.logoUrl) && (
                <Visual aria-hidden>
                  <AppsStageLogoHalftone
                    isLive={hasLiveLogos}
                    logoUrl={app.logoUrl}
                  />
                </Visual>
              )}
              <Content>
                <Top>
                  <AppsStageAppIcon app={app} sizePx={40} />
                </Top>
                <Text>
                  <AppName>{app.name}</AppName>
                  <Tagline>{app.tagline}</Tagline>
                </Text>
              </Content>
            </Card>
          </li>
        );
      })}
    </Cards>
  );
}
