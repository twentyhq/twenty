import {
  type FunctionComponent,
  type MouseEvent,
  type ReactElement,
} from 'react';
import { type IconComponent } from '@ui/icon';

export type MenuItemIconButton = {
  Wrapper?: FunctionComponent<{ iconButton: ReactElement }>;
  Icon: IconComponent;
  accent?: 'secondary' | 'tertiary';
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  ariaLabel?: string;
  dataTestId?: string;
};
