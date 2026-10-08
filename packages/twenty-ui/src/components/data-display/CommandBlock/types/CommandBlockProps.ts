import { type useRender } from '@base-ui/react/use-render';
import { type ReactNode } from 'react';

export type CommandBlockProps = Omit<
  useRender.ComponentProps<'div'>,
  'children'
> & {
  commands: readonly string[];
  actions?: ReactNode;
};
