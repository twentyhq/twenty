import { createState } from '../../state/utils/createState';

export const scrollTopState = createState<number>({
  key: 'scroll/scrollTopState',
  defaultValue: 0,
});
