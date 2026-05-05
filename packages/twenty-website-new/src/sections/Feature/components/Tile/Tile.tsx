import { styled } from '@linaria/react';

import type { ImageType } from '@/design-system/components/Image';
import type { FeatureTileType } from '@/sections/Feature/types/FeatureTile';
import { theme } from '@/theme';
import type { MessageDescriptor } from '@lingui/core';

import { TileContent } from './TileContent';
import { TileVisual } from './TileVisual';

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

type TileProps = {
  index: number;
  mask: ImageType;
  renderText: (descriptor: MessageDescriptor) => string;
  tile: FeatureTileType;
};

export function Tile({ index, mask, renderText, tile }: TileProps) {
  return (
    <TileRoot>
      <TileVisual image={tile.image} index={index} mask={mask} />
      <TileContent renderText={renderText} tile={tile} />
    </TileRoot>
  );
}
