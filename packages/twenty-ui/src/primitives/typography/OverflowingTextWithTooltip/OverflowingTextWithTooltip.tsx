import { isNonEmptyString } from '@sniptt/guards';
import { memo } from 'react';

import { OverflowingText } from './internal/OverflowingText';
import { OverflowingTextTooltip } from './internal/OverflowingTextTooltip';
import { type OverflowingTextWithTooltipProps } from './types/OverflowingTextWithTooltipProps';

export const OverflowingTextWithTooltip = memo(
  function OverflowingTextWithTooltip({
    withTooltip = true,
    text,
    tooltipContent,
    isTooltipMultiline,
    tooltipDelay,
    tooltipPlace,
    alwaysShowTooltip,
    initialPointerPosition,
    isFocusable = false,
    ...textProps
  }: OverflowingTextWithTooltipProps) {
    const textElement = (
      <OverflowingText
        {...textProps}
        tabIndex={textProps.tabIndex ?? (isFocusable ? 0 : undefined)}
      >
        {text}
      </OverflowingText>
    );

    if (!withTooltip) {
      return textElement;
    }

    const tooltipText = isNonEmptyString(tooltipContent)
      ? tooltipContent
      : isNonEmptyString(text)
        ? text
        : null;

    return (
      <OverflowingTextTooltip
        tooltipText={tooltipText}
        isTooltipMultiline={isTooltipMultiline}
        tooltipDelay={tooltipDelay}
        tooltipPlace={tooltipPlace}
        alwaysShowTooltip={alwaysShowTooltip}
        initialPointerPosition={initialPointerPosition}
      >
        {textElement}
      </OverflowingTextTooltip>
    );
  },
);
