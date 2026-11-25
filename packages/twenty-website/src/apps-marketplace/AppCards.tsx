'use client';

import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import {
  color,
  DURATION,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  mediaUp,
  radius,
  REDUCED_MOTION,
  semanticColor,
  SHADOW,
  spacing,
  typeRampDeclarations,
} from '@/tokens';

import { AppDefaultCover } from './AppDefaultCover';
import { AppIcon } from './AppIcon';
import { type MarketplaceApp } from './marketplace-app';

import { leadSentence } from './lead-sentence';

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
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  color: inherit;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  text-decoration: none;
  transition:
    border-color ${DURATION.sm} ${EASING.standard},
    box-shadow ${DURATION.sm} ${EASING.standard},
    transform ${DURATION.sm} ${EASING.standard};

  &:is(:hover, :focus-visible) {
    border-color: ${semanticColor.lineStrong};
    box-shadow: ${SHADOW.card};
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: -2px;
  }

  ${REDUCED_MOTION} {
    transition: none;

    &:hover {
      transform: none;
    }
  }
`;

// The app's own cover when it has one, else the default one.
const Banner = styled.div`
  border-bottom: 1px solid ${semanticColor.line};
  height: ${spacing(28)};
  overflow: hidden;
  position: relative;
`;

const BannerImage = styled.img`
  display: block;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  width: 100%;
`;

const Content = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: ${spacing(4)};
  padding: ${spacing(6)};
`;

// Half of the 40px icon sits on the banner.
const Top = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-top: calc(-1 * (${spacing(6)} + ${spacing(5)}));
  position: relative;
`;

const Text = styled.div`
  & > * + * {
    margin-top: ${spacing(1.5)};
  }
`;

const AppName = styled.h3`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  ${typeRampDeclarations('headingXs')}
  font-weight: ${FONT_WEIGHT.medium};
`;

const Tagline = styled.p`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  color: ${semanticColor.inkMuted};
  display: -webkit-box;
  font-family: ${fontFamily('sans')};
  ${typeRampDeclarations('bodySm')}
  overflow: hidden;
`;

type AppCardsProps = {
  apps: readonly MarketplaceApp[];
};

export function AppCards({ apps }: AppCardsProps) {
  return (
    <Cards>
      {apps.map((app) => {
        return (
          <li key={app.slug}>
            <Card href={`/apps/${app.slug}`}>
              <Banner>
                {isDefined(app.coverUrl) ? (
                  <BannerImage alt="" src={app.coverUrl} />
                ) : (
                  <AppDefaultCover app={app} tilePx={40} />
                )}
              </Banner>
              <Content>
                <Top>
                  <AppIcon app={app} sizePx={40} />
                </Top>
                <Text>
                  <AppName>{app.name}</AppName>
                  <Tagline>{leadSentence(app.tagline)}</Tagline>
                </Text>
              </Content>
            </Card>
          </li>
        );
      })}
    </Cards>
  );
}
