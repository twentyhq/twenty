import {
  PageLayoutTabLayoutMode,
  type PageLayoutWidgetPosition,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type GridPositionInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/grid-position.input';

export const normalizePageLayoutWidgetInputPosition = <
  TInput extends {
    position?: PageLayoutWidgetPosition | null;
    gridPosition?: GridPositionInput | null;
  },
>(
  input: TInput,
): TInput & { position?: PageLayoutWidgetPosition | null } => {
  if (isDefined(input.position)) {
    return input;
  }

  if (!isDefined(input.gridPosition)) {
    return input;
  }

  return {
    ...input,
    position: {
      layoutMode: PageLayoutTabLayoutMode.GRID,
      row: input.gridPosition.row,
      column: input.gridPosition.column,
      rowSpan: input.gridPosition.rowSpan,
      columnSpan: input.gridPosition.columnSpan,
    },
  };
};
