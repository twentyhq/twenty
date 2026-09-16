import { type useRender } from '@base-ui/react/use-render';

export type HeadingProps = Omit<useRender.ComponentProps<'h2'>, 'color'> & {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'tertiary';
};
