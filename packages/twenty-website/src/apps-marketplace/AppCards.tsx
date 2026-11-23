'use client';

import { styled } from '@linaria/react';

import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import {
  color,
  DURATION,
  EASING,
  fontFamily,
  mediaUp,
  radius,
  REDUCED_MOTION,
  semanticColor,
  SHADOW,
  spacing,
  typeRampDeclarations,
} from '@/tokens';

import { AppIcon } from './AppIcon';
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
  ${typeRampDeclarations('headingXs')}
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
              <Content>
                <Top>
                  <AppIcon app={app} sizePx={40} />
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
