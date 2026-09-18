import { type LightIconButtonProps } from '@ui/components/LightIconButton/types/LightIconButtonProps';
import { type IconComponent } from '@ui/icon';
import {
  type FunctionComponent,
  type MouseEvent,
  type ReactElement,
} from 'react';

export type MenuItemIconButton = {
  Wrapper?: FunctionComponent<{ iconButton: ReactElement }>;
  Icon: IconComponent;
  accent?: LightIconButtonProps['accent'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick?: (event: MouseEvent<any>) => void;
  ariaLabel?: string;
  dataTestId?: string;
};
