import {
  SERVED_GEOS,
  type ServedGeo,
} from '@/partners-marketplace/served-geos';

import { WORLD_LAND_GRID } from './world-land-grid.data';
import { worldRegionOfCell } from './world-region-of-cell';

const DASH_INSET = 0.3;

// One dash per land cell, grouped by the region it belongs to, so a region
// can be lit on its own.
export const buildWorldMapRegionPaths = (): {
  regions: Record<ServedGeo, string>;
  unassigned: string;
} => {
  const { degreesPerCell, northLatitude, rows } = WORLD_LAND_GRID;
  const dashLength = degreesPerCell - DASH_INSET * 2;
  const segments = Object.fromEntries(
    SERVED_GEOS.map((geo) => [geo, [] as string[]]),
  ) as Record<ServedGeo, string[]>;
  const unassigned: string[] = [];

  rows.forEach((row, rowIndex) => {
    const y = rowIndex * degreesPerCell + degreesPerCell / 2;
    const latitude = northLatitude - y;
    for (let columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
      if (row[columnIndex] !== '1') {
        continue;
      }
      const x = columnIndex * degreesPerCell + DASH_INSET;
      const longitude = -180 + x + dashLength / 2;
      const region = worldRegionOfCell(longitude, latitude);
      (region === null ? unassigned : segments[region]).push(
        `M${x} ${y}h${dashLength}`,
      );
    }
  });

  return {
    regions: Object.fromEntries(
      SERVED_GEOS.map((geo) => [geo, segments[geo].join('')]),
    ) as Record<ServedGeo, string>,
    unassigned: unassigned.join(''),
  };
};
