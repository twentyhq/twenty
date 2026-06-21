import { styled } from '@linaria/react';
import { msg } from '@lingui/core/macro';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { color, mediaUp, radius, spacing } from '@/tokens';
import {
  Eyebrow,
  Heading,
  SectionIntro,
  SectionShell,
  SectionStack,
} from '@/ui';

import { FEATURE_TILES, type FeatureTile } from './feature-tiles';
import { ScrollEntrance } from './ScrollEntrance';
import { TileContent } from './TileContent';
import { TileVisual } from './TileVisual';

const IntroMeasure = styled.div`
  margin-inline: auto;
  max-width: 688px;
  text-align: center;

  & > * + * {
    margin-top: ${spacing(6)};
  }
`;

const Grid = styled.div`
  border: 1px solid ${color('black-20')};
  border-radius: ${radius(2)};
  display: grid;
  grid-template-columns: 1fr;
  overflow: hidden;

  ${mediaUp('md')} {
    grid-template-columns: repeat(100, 1fr);
  }
`;

const SpotlightCell = styled.div`
  background-color: ${color('neutral')};
  border-bottom: 1px solid ${color('black-20')};
  display: flex;
  flex-direction: column;
  min-width: 0;

  ${mediaUp('md')} {
    grid-column: span 100;
  }
`;

const GridCell = styled.div`
  background-color: ${color('neutral')};
  border-bottom: 1px solid ${color('black-20')};
  display: flex;
  flex-direction: column;
  min-width: 0;

  ${mediaUp('md')} {
    &[data-span='40'] {
      grid-column: span 40;
    }

    &[data-span='60'] {
      grid-column: span 60;
    }

    &:nth-child(even) {
      border-right: 1px solid ${color('black-20')};
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
`;

const SpotlightContent = styled.div`
  width: 100%;
`;

const SpotlightVisual = styled.div`
  border: 1px solid ${color('black-20')};
  border-radius: ${radius(2)};
  margin: ${spacing(4)};
  min-height: 260px;
  overflow: hidden;

  ${mediaUp('md')} {
    margin: ${spacing(5)};
    min-height: 420px;
  }
`;

const CardInner = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;

const CardVisualFrame = styled.div`
  border: 1px solid ${color('black-20')};
  border-radius: ${radius(2)};
  height: 300px;
  margin: ${spacing(4)} ${spacing(4)} 0;
  overflow: hidden;
  position: relative;

  ${mediaUp('md')} {
    height: 340px;
    margin: ${spacing(5)} ${spacing(5)} 0;
  }
`;

const CARD_SPANS = [60, 40, 40, 60, 60, 40];

function padCounter(value: number): string {
  return String(value).padStart(2, '0');
}

function formatCounter(position: number, totalCount: number): string {
  return `${padCounter(position)} / ${padCounter(totalCount)}`;
}

function Tiles({ tiles }: { tiles: FeatureTile[] }) {
  const totalCount = tiles.length;
  const numberedTiles = tiles.map((tile, tileNumber) => ({
    tile,
    tileNumber,
  }));

  return (
    <Grid>
      {numberedTiles.map(({ tile, tileNumber }) => {
        const counter = formatCounter(tileNumber + 1, totalCount);

        if (tileNumber === 0) {
          return (
            <SpotlightCell key={tileNumber}>
              <ScrollEntrance>
                <SpotlightInner>
                  <SpotlightVisual>
                    <TileVisual visualKey={tile.visual} />
                  </SpotlightVisual>
                  <SpotlightContent>
                    <TileContent counter={counter} spotlight tile={tile} />
                  </SpotlightContent>
                </SpotlightInner>
              </ScrollEntrance>
            </SpotlightCell>
          );
        }

        return (
          <GridCell key={tileNumber} data-span={CARD_SPANS[tileNumber - 1]}>
            <ScrollEntrance>
              <CardInner>
                <CardVisualFrame>
                  <TileVisual visualKey={tile.visual} />
                </CardVisualFrame>
                <TileContent counter={counter} spotlight={false} tile={tile} />
              </CardInner>
            </ScrollEntrance>
          </GridCell>
        );
      })}
    </Grid>
  );
}

export function ProductFeature() {
  const i18n = getServerI18n();

  return (
    <SectionShell rhythm="section" scheme="light">
      <SectionStack>
        <SectionIntro>
          <IntroMeasure>
            <Eyebrow>{i18n._(msg`Core Features`)}</Eyebrow>
            <Heading as="h2" size="lg" weight="light">
              {i18n._(msg`Everything you need, *out of the box*`)}
            </Heading>
          </IntroMeasure>
        </SectionIntro>
        <Tiles tiles={FEATURE_TILES} />
      </SectionStack>
    </SectionShell>
  );
}
