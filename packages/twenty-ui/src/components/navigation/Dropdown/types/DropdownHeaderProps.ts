import { type ReactNode } from 'react';

export type DropdownHeaderProps = {
  children: ReactNode;
  action?: {
    icon: 'close' | 'back';
    label: string;
    onClick: () => void;
  };
};
