import type { ImageType } from '@/design-system/components/Image';
import type { FeatureTileType } from '@/sections/Feature/types/FeatureTile';
import { theme } from '@/theme';
import type { MessageDescriptor } from '@lingui/core';
import { styled } from '@linaria/react';
import { Tile } from './Tile/Tile';

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

type TilesProps = {
  mask: ImageType;
  renderText: (descriptor: MessageDescriptor) => string;
  tiles: FeatureTileType[];
};

export function Tiles({ mask, renderText, tiles }: TilesProps) {
  return (
    <TilesGrid>
      {tiles.map((tile, index) => (
        <TileCell data-index={index} key={`${tile.heading.text}-${index}`}>
          <Tile index={index} mask={mask} renderText={renderText} tile={tile} />
        </TileCell>
      ))}
    </TilesGrid>
  );
}
