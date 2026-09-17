import { memo, type MouseEvent, type ReactNode, useRef, useState } from 'react';

import { isNonEmptyString } from '@sniptt/guards';
import { clsx } from 'clsx';
import { Tooltip } from '@ui/primitives/surfaces/Tooltip/Tooltip';
import { type TooltipSide } from '@ui/primitives/surfaces/Tooltip/types/TooltipSide';
import { LinkifiedText } from '@ui/primitives/typography/LinkifiedText/LinkifiedText';
import { Text } from '@ui/primitives/typography/Text/Text';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './OverflowingTextWithTooltip.module.scss';

type OverflowingTextWithTooltipProps = {
  size?: 'large' | 'small';
  isTooltipMultiline?: boolean;
  displayedMaxRows?: number;
  tooltipDelay?: number;
  tooltipPlace?: TooltipSide;
  alwaysShowTooltip?: boolean;
  isFocusable?: boolean;
} & (
  | {
      text: string | null | undefined;
      tooltipContent?: string;
    }
  | {
      text: Exclude<ReactNode, string | null | undefined>;
      tooltipContent: string;
    }
);

export const OverflowingTextWithTooltip = memo(
  function OverflowingTextWithTooltip({
    size = 'small',
    text,
    isTooltipMultiline,
    displayedMaxRows,
    tooltipContent,
    tooltipDelay = 500,
    tooltipPlace = 'bottom',
    alwaysShowTooltip = false,
    isFocusable = false,
  }: OverflowingTextWithTooltipProps) {
    const textRef = useRef<HTMLDivElement>(null);

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

    const handleTextClick = () => {
      textRef.current?.focus();
      handleOpenChange(true);
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

    const isMultiline = isDefined(displayedMaxRows);

    return (
      <Tooltip.Root
        open={isTooltipOpen && isDefined(tooltipText)}
        onOpenChange={(...openChangeArguments) => {
          const [open, eventDetails] = openChangeArguments;
          const shouldKeepTooltipOpen =
            !open &&
            eventDetails.reason === 'trigger-hover' &&
            isFocusable &&
            document.activeElement === textRef.current;

          if (shouldKeepTooltipOpen) {
            eventDetails.cancel();

            return;
          }

          handleOpenChange(open);
        }}
        disabled={
          !isDefined(tooltipText) || (!isTitleOverflowing && !alwaysShowTooltip)
        }
      >
        <Tooltip.Trigger
          delay={tooltipDelay}
          closeOnClick={false}
          render={
            <Text
              {...(isMultiline
                ? { lineClamp: displayedMaxRows || 1 }
                : { truncate: true })}
              data-testid="tooltip"
              data-content-overflowing={isTitleOverflowing ? '' : undefined}
              className={clsx(
                isMultiline
                  ? styles.overflowingMultilineText
                  : styles.overflowingText,
                size === 'large' && styles.large,
              )}
              ref={textRef}
              tabIndex={isFocusable ? 0 : undefined}
              onPointerEnter={updateOverflowState}
              onFocus={isFocusable ? () => handleOpenChange(true) : undefined}
              onClick={isFocusable ? handleTextClick : undefined}
            >
              {isNonEmptyString(text) ? <LinkifiedText text={text} /> : text}
            </Text>
          }
        />
        <Tooltip.Popup
          className={isTooltipMultiline ? styles.multilineTooltip : undefined}
          sideOffset={5}
          side={tooltipPlace}
          positionMethod="absolute"
          onClick={handleTooltipClick}
        >
          {tooltipText}
        </Tooltip.Popup>
      </Tooltip.Root>
    );
  },
);
