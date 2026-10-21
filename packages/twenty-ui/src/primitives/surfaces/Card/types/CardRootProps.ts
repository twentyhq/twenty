import { type useRender } from '@base-ui/react/use-render';

export type CardRootProps = useRender.ComponentProps<'div'> & {
  fullWidth?: boolean;
  backgroundColor?: string;
};
