import { type useRender } from '@base-ui/react/use-render';

export type CardContentProps = useRender.ComponentProps<'div'> & {
  divider?: boolean;
};
