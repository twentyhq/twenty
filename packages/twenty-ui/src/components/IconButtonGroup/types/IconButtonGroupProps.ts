import { type IconComponent } from '@ui/icon';
import { type MouseEvent } from 'react';

export type IconButtonGroupProps = {
  disabled?: boolean;
  iconButtons: {
    Icon: IconComponent;
    ariaLabel?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onClick?: (event: MouseEvent<any>) => void;
  }[];
  className?: string;
};
