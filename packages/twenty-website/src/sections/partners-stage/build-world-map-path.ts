import { WORLD_LAND_GRID } from './world-land-grid.data';

const DASH_INSET = 0.3;

// One horizontal dash per land cell, in degrees: x runs 0-360 from 180W, y
// runs down from the grid's north edge.
export const buildWorldMapPath = (): string => {
  const { degreesPerCell, rows } = WORLD_LAND_GRID;
  const dashLength = degreesPerCell - DASH_INSET * 2;
  const segments: string[] = [];

  rows.forEach((row, rowIndex) => {
    const y = rowIndex * degreesPerCell + degreesPerCell / 2;
    for (let columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
      if (row[columnIndex] === '1') {
        const x = columnIndex * degreesPerCell + DASH_INSET;
        segments.push(`M${x} ${y}h${dashLength}`);
      }
    }
  });

  return segments.join('');
};
