import { PositionType } from 'src/navigation/context-menu/types/PositionType';
import { createState } from 'src/utilities';

export const contextMenuPositionState = createState<PositionType>({
  key: 'contextMenuPositionState',
  defaultValue: {
    x: null,
    y: null,
  },
});
