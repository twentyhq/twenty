import { type FloatingIconButtonProps } from '@ui/components/FloatingIconButton/types/FloatingIconButtonProps';
import { type IconComponent } from '@ui/icon';
import { type MouseEvent } from 'react';

export type FloatingIconButtonGroupProps = Pick<
  FloatingIconButtonProps,
  'className' | 'size'
> & {
  iconButtons: {
    Icon: IconComponent;
    ariaLabel?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onClick?: (event: MouseEvent<any>) => void;
    isActive?: boolean;
  }[];
};
