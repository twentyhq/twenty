import { type useRender } from '@base-ui/react/use-render';

export type CardFooterProps = useRender.ComponentProps<'div'> & {
  divider?: boolean;
};
