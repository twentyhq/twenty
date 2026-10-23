import { type useRender } from '@base-ui/react/use-render';

export type CountPagerProps = Omit<
  useRender.ComponentProps<'div'>,
  'children'
> & {
  index: number;
  count: number;
  onIndexChange: (index: number) => void;
  positionText: string;
  previousLabel: string;
  nextLabel: string;
  disabled?: boolean;
  positionPlacement?: 'between' | 'start';
};
