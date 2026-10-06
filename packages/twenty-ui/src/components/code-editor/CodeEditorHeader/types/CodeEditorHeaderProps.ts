import { type useRender } from '@base-ui/react/use-render';
import { type ReactNode } from 'react';

export type CodeEditorHeaderProps = Omit<
  useRender.ComponentProps<'div'>,
  'title' | 'children'
> & {
  title?: ReactNode;
  startElement?: ReactNode;
  endElement?: ReactNode;
};
