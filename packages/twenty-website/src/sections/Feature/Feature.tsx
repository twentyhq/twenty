import { Container } from '@/design-system/components';
import type { MessageDescriptor } from '@lingui/core';
import { type Page, Pages } from '@/lib/pages';
import { theme, type Scheme } from '@/theme';
import { styled } from '@linaria/react';
import type { ComponentType, ReactNode } from 'react';

import { FeatureScrollEntrance } from './FeatureScrollEntrance';
import { TileContent } from './TileContent';
import { TileVisual } from './TileVisual';

export type FeatureBullet = {
  icon: string;
  text: MessageDescriptor;
};

export type FeatureTileType = {
  bullets: FeatureBullet[];
  category: MessageDescriptor;
  description: MessageDescriptor;
  heading: MessageDescriptor;
  visual: ComponentType<{ active: boolean }>;
};

// --- Root ---

const StyledSection = styled.section`
  width: 100%;

  &[data-scheme='light'] {
    background-color: var(--color-white);
  }

  &[data-scheme='muted'] {
    background-color: var(--color-neutral);
  }

  &[data-scheme='dark'] {
    background-color: var(--color-black);
  }
`;

const StyledContainer = styled(Container)`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing(6)};
  padding-bottom: ${theme.spacing(12)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(12)};

  @media (min-width: ${theme.breakpoints.md}px) {
    gap: ${theme.spacing(10)};
    padding-bottom: ${theme.spacing(20)};
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${theme.spacing(20)};
  }
`;

type RootProps = {
  backgroundColor?: string;
  children: ReactNode;
  scheme?: Scheme;
};

function Root({ backgroundColor, children, scheme }: RootProps) {
  return (
    <StyledSection
      data-scheme={scheme}
      style={scheme ? undefined : { backgroundColor }}
    >
      <StyledContainer>{children}</StyledContainer>
    </StyledSection>
  );
}

// --- Intro ---

const StyledIntro = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${theme.spacing(6)};
  text-align: start;

  &[data-align='center'] {
    justify-items: center;
    margin-left: auto;
    margin-right: auto;
    text-align: center;
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 688px;

    &[data-page=${Pages.Home}] {
      max-width: 900px;
    }
  }
`;

type IntroProps = {
  align: 'center' | 'left';
  children: ReactNode;
  page: Page;
};

function Intro({ align, children, page }: IntroProps) {
  return (
    <StyledIntro data-align={align} data-page={page}>
      {children}
    </StyledIntro>
  );
}

// --- Tiles ---

const BORDER = `1px solid ${theme.colors.primary.border[20]}`;

const Grid = styled.div`
  border: ${BORDER};
  border-radius: ${theme.radius(2)};
  display: grid;
  grid-template-columns: 1fr;
  overflow: hidden;

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const SpotlightCell = styled.div`
  border-bottom: ${BORDER};
  display: flex;
  flex-direction: column;
  min-width: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-column: span 2;
  }
`;

const GridCell = styled.div`
  border-bottom: ${BORDER};
  display: flex;
  flex-direction: column;
  min-width: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    &:nth-child(even) {
      border-right: ${BORDER};
    }

    &:nth-last-child(-n + 2) {
      border-bottom: none;
    }
  }
`;

const SpotlightInner = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    flex-direction: row;
    min-height: 420px;
  }
`;

const SpotlightContent = styled.div`
  @media (min-width: ${theme.breakpoints.md}px) {
    flex: 1;
    min-width: 0;
  }
`;

const SpotlightVisual = styled.div`
  min-height: 260px;

  @media (min-width: ${theme.breakpoints.md}px) {
    flex: 1.1;
    min-width: 0;
  }
`;

const CardInner = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;

const CardVisualFrame = styled.div`
  height: 300px;
  margin: ${theme.spacing(4)} ${theme.spacing(4)} 0;
  overflow: hidden;
  position: relative;

  @media (min-width: ${theme.breakpoints.md}px) {
    height: 340px;
    margin: ${theme.spacing(5)} ${theme.spacing(5)} 0;
  }
`;

type TilesProps = {
  tiles: FeatureTileType[];
};

function Tiles({ tiles }: TilesProps) {
  const totalCount = tiles.length;

  return (
    <Grid>
      {tiles.map((tile, index) => {
        const isSpotlight = index === 0;
        const counter = `${String(index + 1).padStart(2, '0')} / ${String(totalCount).padStart(2, '0')}`;

        if (isSpotlight) {
          return (
            <SpotlightCell key={index}>
              <FeatureScrollEntrance index={index}>
                <SpotlightInner>
                  <SpotlightContent>
                    <TileContent counter={counter} spotlight tile={tile} />
                  </SpotlightContent>
                  <SpotlightVisual>
                    <TileVisual visual={tile.visual} />
                  </SpotlightVisual>
                </SpotlightInner>
              </FeatureScrollEntrance>
            </SpotlightCell>
          );
        }

        return (
          <GridCell key={index}>
            <FeatureScrollEntrance index={index}>
              <CardInner>
                <CardVisualFrame>
                  <TileVisual visual={tile.visual} />
                </CardVisualFrame>
                <TileContent counter={counter} spotlight={false} tile={tile} />
              </CardInner>
            </FeatureScrollEntrance>
          </GridCell>
        );
      })}
    </Grid>
  );
}

export const Feature = { Intro, Root, Tiles };
