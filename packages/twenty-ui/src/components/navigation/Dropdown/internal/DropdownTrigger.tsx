import { Popover } from '@ui/primitives/surfaces/Popover/Popover';

import { type DropdownTriggerProps } from '../types/DropdownTriggerProps';
import { useDropdownContext } from './useDropdownContext';

export const DropdownTrigger = ({
  onKeyDown,
  onClick,
  ...props
}: DropdownTriggerProps) => {
  const { type, setOpen, setInitialFocusEdge, setFocusOnOpen } =
    useDropdownContext();

  return (
    <Popover.Trigger
      {...props}
      aria-haspopup={type === 'menu' ? 'menu' : 'dialog'}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);

        if (event.defaultPrevented || props.disabled || type === 'panel') {
          return;
        }

        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
          return;
        }

        event.preventDefault();
        setFocusOnOpen(true);
        setInitialFocusEdge(event.key === 'ArrowUp' ? 'last' : 'first');
        setOpen(true);
      }}
    />
  );
};
