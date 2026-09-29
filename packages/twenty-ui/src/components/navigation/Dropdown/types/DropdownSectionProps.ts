import { type ComponentPropsWithRef, type ReactNode } from 'react';

export type DropdownSectionProps = ComponentPropsWithRef<'div'> & {
  label?: ReactNode;
  scrollable?: boolean;
};
