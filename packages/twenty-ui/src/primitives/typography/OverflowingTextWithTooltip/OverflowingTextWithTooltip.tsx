import { mergeProps } from '@base-ui/react/merge-props';
import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { memo, useContext, useRef, useState, type MouseEvent } from 'react';

import { isNonEmptyString } from '@sniptt/guards';
import { Tooltip } from '@ui/primitives/surfaces/Tooltip/Tooltip';
import { TooltipBody } from '@ui/primitives/surfaces/Tooltip/internal/TooltipBody';
import { Text } from '@ui/primitives/typography/Text/Text';
import { isElementOverflowing } from './internal/isElementOverflowing';
import { OverflowingTextTooltipModeContext } from './internal/OverflowingTextTooltipModeContext';
import { type OverflowingTextWithTooltipProps } from './types/OverflowingTextWithTooltipProps';
import { isDefined } from '@ui/utilities/utils/isDefined';
import { clsx } from 'clsx';

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
    isFocusable = false,
    render,
    ref,
    className,
    ...props
  }: OverflowingTextWithTooltipProps) {
    const tooltipMode = useContext(OverflowingTextTooltipModeContext);
    const areTooltipsDisabled = tooltipMode === 'disabled';
    const textRef = useRef<HTMLDivElement>(null);

    const [isTitleOverflowing, setIsTitleOverflowing] = useState(false);
    const [isTooltipOpen, setIsTooltipOpen] = useState(false);

    const mergedRef = useMergedRefs(textRef, ref);

    const updateOverflowState = () => {
      const isOverflowing = isElementOverflowing(textRef.current);

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

    const isMultiline = isDefined(lineClamp);

    const textElement = (
      <Text
        {...(isMultiline ? { lineClamp } : { truncate: truncate ?? true })}
        dir="auto"
        data-content-overflowing={isTitleOverflowing ? '' : undefined}
        className={clsx(
          isMultiline
            ? styles.overflowingMultilineText
            : styles.overflowingText,
          className,
        )}
        render={render}
        ref={mergedRef}
        {...mergeProps<'div'>(
          {
            tabIndex: isFocusable ? 0 : undefined,
            ...(areTooltipsDisabled
              ? {}
              : {
                  onPointerEnter: updateOverflowState,
                  onFocus: () => handleOpenChange(true),
                }),
          },
          props,
        )}
      >
        {text}
      </Text>
    );

    if (areTooltipsDisabled) {
      return textElement;
    }

    return (
      <Tooltip.Root
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
          (tooltipMode === 'measure-on-hover' &&
            !isTitleOverflowing &&
            !alwaysShowTooltip)
        }
      >
        <Tooltip.Trigger
          delay={tooltipDelay}
          closeOnClick={false}
          render={textElement}
        />
        <Tooltip.Portal>
          <Tooltip.Positioner sideOffset={5} side={tooltipPlace}>
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
