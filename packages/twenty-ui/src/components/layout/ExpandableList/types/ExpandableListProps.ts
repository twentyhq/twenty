import { type ComponentPropsWithRef, type ReactElement } from 'react';

export type ExpandableListProps = Omit<
  ComponentPropsWithRef<'div'>,
  'children'
> & {
  children: ReactElement[];
  showOverflowCount?: boolean;
  maxInlineCount?: number;
  overflowLabel?: string;
};
