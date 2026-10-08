import { useMergedRefs } from '@base-ui/utils/useMergedRefs';

import { Popover } from '@ui/primitives/surfaces/Popover/Popover';

import { type DropdownTriggerProps } from '../types/DropdownTriggerProps';
import { useDropdownContext } from './useDropdownContext';
import { useRegisterDropdownLabelElement } from './useRegisterDropdownLabelElement';

export const DropdownTrigger = ({
  onKeyDown,
  onClick,
  ref,
  ...props
}: DropdownTriggerProps) => {
  const {
    type,
    rootType,
    open,
    setOpen,
    setInitialFocusEdge,
    setFocusOnOpen,
    registerTrigger,
  } = useDropdownContext();
  const triggerType = open ? type : rootType;
  const registerTriggerElement =
    useRegisterDropdownLabelElement(registerTrigger);
  const mergedRef = useMergedRefs(ref, registerTriggerElement);

  return (
    <Popover.Trigger
      {...props}
      ref={mergedRef}
      aria-haspopup={triggerType === 'menu' ? 'menu' : 'dialog'}
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();
        onClick?.(event);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);

        if (
          event.defaultPrevented ||
          event.baseUIHandlerPrevented ||
          props.disabled ||
          triggerType === 'panel'
        ) {
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
