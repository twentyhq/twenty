import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import { isFunction, isNumber, isString } from '@sniptt/guards';
import { type ReactNode } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type TooltipProps } from '../types/TooltipProps';
import { TooltipArrow } from './TooltipArrow';
import { TooltipBody } from './TooltipBody';
import { TooltipPopup } from './TooltipPopup';
import { TooltipPortal } from './TooltipPortal';
import { TooltipPositioner } from './TooltipPositioner';

const DEFAULT_SIDE_OFFSET = 10;
const DEFAULT_MAX_WIDTH = '300px';

export const TooltipComponent = <TPayload,>({
  content,
  children,
  description,
  startIcon,
  open,
  defaultOpen,
  onOpenChange,
  onOpenChangeComplete,
  disabled = false,
  disableHoverablePopup,
  trackCursorAxis,
  actionsRef,
  handle,
  triggerId,
  defaultTriggerId,
  delay,
  closeDelay,
  closeOnClick,
  side = 'top',
  align = 'center',
  sideOffset = DEFAULT_SIDE_OFFSET,
  alignOffset,
  anchor,
  positionMethod,
  collisionBoundary,
  collisionPadding,
  collisionAvoidance,
  sticky,
  arrowPadding,
  disableAnchorTracking,
  arrow = false,
  maxWidth = DEFAULT_MAX_WIDTH,
  container,
  keepMounted,
  triggerProps,
  positionerProps,
  portalProps,
  ...popupProps
}: TooltipProps<TPayload>) => {
  const isDisabled =
    disabled ||
    (!isDefined(content) && !isDefined(description)) ||
    content === '' ||
    content === false;

  const trigger = (
    <TooltipPrimitive.Trigger
      render={children}
      delay={delay}
      closeDelay={closeDelay}
      closeOnClick={closeOnClick}
      {...triggerProps}
    />
  );

  const renderContent = (resolvedContent: ReactNode) => {
    const hasTextLayout =
      isString(resolvedContent) ||
      isNumber(resolvedContent) ||
      isDefined(description) ||
      isDefined(startIcon);

    return (
      <>
        {trigger}
        <TooltipPortal
          container={container}
          keepMounted={keepMounted}
          {...portalProps}
        >
          <TooltipPositioner
            side={side}
            align={align}
            sideOffset={sideOffset}
            alignOffset={alignOffset}
            anchor={anchor}
            positionMethod={positionMethod}
            collisionBoundary={collisionBoundary}
            collisionPadding={collisionPadding}
            collisionAvoidance={collisionAvoidance}
            sticky={sticky}
            arrowPadding={arrowPadding}
            disableAnchorTracking={disableAnchorTracking}
            style={{ maxWidth }}
            {...positionerProps}
          >
            <TooltipPopup {...popupProps}>
              {hasTextLayout ? (
                <TooltipBody description={description} startIcon={startIcon}>
                  {resolvedContent}
                </TooltipBody>
              ) : (
                resolvedContent
              )}
              {arrow && <TooltipArrow />}
            </TooltipPopup>
          </TooltipPositioner>
        </TooltipPortal>
      </>
    );
  };

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
      handle={handle}
      triggerId={triggerId}
      defaultTriggerId={defaultTriggerId}
    >
      {isFunction(content)
        ? (payloadState) => renderContent(content(payloadState))
        : renderContent(content)}
    </TooltipPrimitive.Root>
  );
};
