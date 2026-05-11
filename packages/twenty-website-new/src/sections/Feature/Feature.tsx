import { Container } from '@/design-system/components';
import type { ImageType } from '@/design-system/components/Image';
import type { MessageDescriptor } from '@lingui/core';
import { type Page, Pages } from '@/lib/pages';
import { theme, type Scheme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

import { TileContent } from './TileContent';
import { TileVisual } from './TileVisual';

export type FeatureTileType = {
  bullets: MessageDescriptor[];
  heading: MessageDescriptor;
  icon: string;
  image: ImageType;
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

const TilesGrid = styled.div`
  display: grid;
  gap: ${theme.spacing(4)};
  grid-template-columns: 1fr;

  @media (min-width: ${theme.breakpoints.md}px) {
    gap: ${theme.spacing(4)};
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }
`;

const TileCell = styled.div`
  min-width: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    &[data-index='0'] {
      grid-column: span 12;
    }
    &[data-index='1'],
    &[data-index='2'],
    &[data-index='5'],
    &[data-index='6'] {
      grid-column: span 6;
    }
    &[data-index='3'] {
      grid-column: span 4;
    }
    &[data-index='4'] {
      grid-column: span 8;
    }
  }
`;

const TileRoot = styled.article`
  background-color: ${theme.colors.primary.background[100]};
  border: 1px solid ${theme.colors.primary.border[20]};
  border-radius: ${theme.radius(2)};
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto;
  height: 100%;
  min-width: 0;
  overflow: hidden;
`;

type TilesProps = {
  mask: ImageType;
  tiles: FeatureTileType[];
};

function Tiles({ mask, tiles }: TilesProps) {
  return (
    <TilesGrid>
      {tiles.map((tile, index) => (
        <TileCell data-index={index} key={index}>
          <TileRoot>
            <TileVisual image={tile.image} index={index} mask={mask} />
            <TileContent tile={tile} />
          </TileRoot>
        </TileCell>
      ))}
    </TilesGrid>
  );
}

export const Feature = { Intro, Root, Tiles };
