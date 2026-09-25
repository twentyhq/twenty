import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

import { LightIconButton } from '@ui/components/input/LightIconButton/LightIconButton';
import { IconX } from '@ui/icon';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { type DropdownCloseProps } from '../types/DropdownCloseProps';

export const DropdownClose = ({
  render,
  children,
  'aria-label': ariaLabel,
  ...props
}: DropdownCloseProps) => (
  <PopoverPrimitive.Close
    {...props}
    aria-label={ariaLabel}
    render={
      render ?? (
        <LightIconButton size="sm" aria-label={ariaLabel}>
          {children ?? <IconX />}
        </LightIconButton>
      )
    }
  >
    {isDefined(render) ? children : undefined}
  </PopoverPrimitive.Close>
);
