import { type ReactNode } from 'react';

import { type DropdownKind } from './DropdownKind';

export type DropdownPageProps = {
  id: string;
  kind?: DropdownKind;
  children: ReactNode;
};
