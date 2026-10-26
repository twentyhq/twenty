import { useMergedRefs } from '@base-ui/utils/useMergedRefs';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { Popover } from '@ui/primitives/surfaces/Popover/Popover';

import { type DropdownTriggerProps } from '../types/DropdownTriggerProps';
import { useDropdownContext } from './useDropdownContext';
import { getDropdownTriggerTabTarget } from './getDropdownTriggerTabTarget';
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

        const isForwardTabFromOpenPicker =
          open &&
          triggerType === 'picker' &&
          event.key === 'Tab' &&
          !event.shiftKey;
        const tabTarget = isForwardTabFromOpenPicker
          ? getDropdownTriggerTabTarget(event.currentTarget)
          : undefined;

        if (isDefined(tabTarget)) {
          event.preventDefault();
          tabTarget.focus();
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
