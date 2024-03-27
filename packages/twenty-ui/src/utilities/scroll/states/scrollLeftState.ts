import { createState } from '../../state/utils/createState';

export const scrollLeftState = createState<number>({
  key: 'scroll/scrollLeftState',
  defaultValue: 0,
});
