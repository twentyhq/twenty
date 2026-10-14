import { mergeProps } from '@base-ui/react/merge-props';
import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { memo, useId, useRef, useState, type MouseEvent } from 'react';

import { isNonEmptyString } from '@sniptt/guards';
import { Tooltip } from '@ui/primitives/surfaces/Tooltip/Tooltip';
import { TooltipBody } from '@ui/primitives/surfaces/Tooltip/internal/TooltipBody';
import { OverflowingText } from '@ui/primitives/typography/OverflowingText/OverflowingText';
import { OverflowingTextInitialHoverEffect } from './internal/OverflowingTextInitialHoverEffect';
import { type OverflowingTextWithTooltipProps } from './types/OverflowingTextWithTooltipProps';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './OverflowingTextWithTooltip.module.scss';

export const OverflowingTextWithTooltip = memo(
  function OverflowingTextWithTooltip({
    text,
    isTooltipMultiline,
    truncate,
    lineClamp,
    tooltipContent,
    tooltipDelay = 500,
    tooltipPlace = 'bottom',
    alwaysShowTooltip = false,
    measureOverflowOnOpen = false,
    initialPointerPosition,
    isFocusable = false,
    render,
    ref,
    className,
    ...props
  }: OverflowingTextWithTooltipProps) {
    const textRef = useRef<HTMLDivElement>(null);
    const mergedRef = useMergedRefs(textRef, ref);
    const generatedTriggerId = useId();
    const triggerId = props.id ?? generatedTriggerId;
    const [tooltipHandle] = useState(() => Tooltip.createHandle());

    const [isTitleOverflowing, setIsTitleOverflowing] = useState(false);
    const [isTooltipOpen, setIsTooltipOpen] = useState(false);

    const updateOverflowState = () => {
      const textElement = textRef.current;
      const isOverflowing =
        isDefined(textElement) &&
        (textElement.scrollHeight > textElement.clientHeight ||
          textElement.scrollWidth > textElement.clientWidth);

      setIsTitleOverflowing(isOverflowing);

      return isOverflowing;
    };

    const handleOpenChange = (open: boolean) => {
      if (!open) {
        setIsTooltipOpen(false);

        return;
      }

      const isOverflowing = updateOverflowState();

      setIsTooltipOpen(isOverflowing || alwaysShowTooltip);
    };

    const handleTooltipClick = (event: MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
      event.preventDefault();
    };

    const tooltipText = isNonEmptyString(tooltipContent)
      ? tooltipContent
      : isNonEmptyString(text)
        ? text
        : null;

    return (
      <Tooltip.Root
        handle={tooltipHandle}
        open={isTooltipOpen && isDefined(tooltipText)}
        onOpenChange={(...openChangeArguments) => {
          const [open, eventDetails] = openChangeArguments;
          const shouldKeepTooltipOpen =
            !open &&
            eventDetails.reason === 'trigger-hover' &&
            textRef.current?.contains(document.activeElement);

          if (shouldKeepTooltipOpen) {
            eventDetails.cancel();

            return;
          }

          handleOpenChange(open);
        }}
        disabled={
          !isDefined(tooltipText) ||
          (!measureOverflowOnOpen &&
            !isDefined(initialPointerPosition) &&
            !isTitleOverflowing &&
            !alwaysShowTooltip)
        }
      >
        <Tooltip.Trigger
          id={triggerId}
          handle={tooltipHandle}
          delay={tooltipDelay}
          closeOnClick={false}
          render={
            <OverflowingText
              {...(isDefined(lineClamp) ? { lineClamp } : { truncate })}
              data-content-overflowing={isTitleOverflowing ? '' : undefined}
              className={className}
              render={render}
              ref={mergedRef}
              {...mergeProps<'div'>(
                {
                  tabIndex: isFocusable ? 0 : undefined,
                  onPointerEnter: updateOverflowState,
                  onFocus: () => handleOpenChange(true),
                },
                props,
              )}
            >
              {text}
            </OverflowingText>
          }
        />
        {isDefined(initialPointerPosition) && (
          <OverflowingTextInitialHoverEffect
            textRef={textRef}
            pointerPosition={initialPointerPosition}
            tooltipDelay={tooltipDelay}
            tooltipHandle={tooltipHandle}
            triggerId={triggerId}
          />
        )}
        <Tooltip.Portal>
          <Tooltip.Positioner
            sideOffset={5}
            side={tooltipPlace}
            positionMethod="absolute"
            style={{ maxWidth: '300px' }}
          >
            <Tooltip.Popup
              className={
                isTooltipMultiline ? styles.multilineTooltip : undefined
              }
              onClick={handleTooltipClick}
            >
              <TooltipBody>{tooltipText}</TooltipBody>
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    );
  },
);
