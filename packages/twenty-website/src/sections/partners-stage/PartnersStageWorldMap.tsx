import { styled } from '@linaria/react';

import { color } from '@/tokens';

import { buildWorldMapPath } from './build-world-map-path';
import { WORLD_LAND_GRID } from './world-land-grid.data';

const MapSvg = styled.svg`
  display: block;
  height: auto;
  width: 100%;
`;

const LandDashes = styled.path`
  fill: none;
  stroke: ${color('white-20')};
  stroke-width: 0.7;
`;

const WORLD_MAP_PATH = buildWorldMapPath();
const MAP_HEIGHT = WORLD_LAND_GRID.rows.length * WORLD_LAND_GRID.degreesPerCell;

// PROTOTYPE
export function PartnersStageWorldMap() {
  return (
    <MapSvg aria-hidden viewBox={`0 0 360 ${MAP_HEIGHT}`}>
      <LandDashes d={WORLD_MAP_PATH} />
    </MapSvg>
  );
}
