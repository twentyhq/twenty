import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

import { type DropdownTriggerProps } from '../types/DropdownTriggerProps';
import { useDropdownContext } from './useDropdownContext';

export const DropdownTrigger = ({
  onKeyDown,
  onClick,
  ...props
}: DropdownTriggerProps) => {
  const { kind, setOpen, initialFocusEdgeRef, focusOnOpenRef } =
    useDropdownContext();

  return (
    <PopoverPrimitive.Trigger
      {...props}
      aria-haspopup={kind === 'menu' ? 'menu' : 'dialog'}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);

        if (event.defaultPrevented || props.disabled || kind === 'panel') {
          return;
        }

        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
          return;
        }

        event.preventDefault();
        focusOnOpenRef.current = true;
        initialFocusEdgeRef.current =
          event.key === 'ArrowUp' ? 'last' : 'first';
        setOpen(true);
      }}
    />
  );
};
