import { type ReactNode } from 'react';

import { type DropdownType } from './DropdownType';

export type DropdownPageProps = {
  id: string;
  type?: DropdownType;
  children: ReactNode;
};
