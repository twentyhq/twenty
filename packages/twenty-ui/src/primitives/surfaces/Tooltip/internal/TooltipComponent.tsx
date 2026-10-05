import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type TooltipProps } from '../types/TooltipProps';
import { TooltipPopup } from './TooltipPopup';

export const TooltipComponent = ({
  content,
  children,
  open,
  defaultOpen,
  onOpenChange,
  onOpenChangeComplete,
  disabled = false,
  disableHoverablePopup,
  trackCursorAxis,
  actionsRef,
  triggerId,
  defaultTriggerId,
  delay,
  closeDelay,
  closeOnClick,
  ...props
}: TooltipProps) => {
  const isDisabled =
    disabled || !isDefined(content) || content === '' || content === false;

  return (
    <TooltipPrimitive.Root
      open={isDefined(open) ? open && !isDisabled : undefined}
      defaultOpen={defaultOpen && !isDisabled}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={onOpenChangeComplete}
      disabled={isDisabled}
      disableHoverablePopup={disableHoverablePopup}
      trackCursorAxis={trackCursorAxis}
      actionsRef={actionsRef}
      triggerId={triggerId}
      defaultTriggerId={defaultTriggerId}
    >
      <TooltipPrimitive.Trigger
        render={children}
        delay={delay}
        closeDelay={closeDelay}
        closeOnClick={closeOnClick}
      />
      <TooltipPopup {...props}>{content}</TooltipPopup>
    </TooltipPrimitive.Root>
  );
};
