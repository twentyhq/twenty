import { memo } from 'react';

import { OverflowingText } from './internal/OverflowingText';
import { OverflowingTextTooltip } from './internal/OverflowingTextTooltip';
import { type OverflowingTextWithTooltipProps } from './types/OverflowingTextWithTooltipProps';

export const OverflowingTextWithTooltip = memo(
  function OverflowingTextWithTooltip({
    withTooltip = true,
    ...props
  }: OverflowingTextWithTooltipProps) {
    if (withTooltip) {
      return <OverflowingTextTooltip {...props} />;
    }

    const {
      text,
      tooltipContent: _tooltipContent,
      isTooltipMultiline: _isTooltipMultiline,
      tooltipDelay: _tooltipDelay,
      tooltipPlace: _tooltipPlace,
      alwaysShowTooltip: _alwaysShowTooltip,
      measureOverflowOnOpen: _measureOverflowOnOpen,
      initialPointerPosition: _initialPointerPosition,
      isFocusable = false,
      ...textProps
    } = props;

    return (
      <OverflowingText
        {...textProps}
        tabIndex={textProps.tabIndex ?? (isFocusable ? 0 : undefined)}
      >
        {text}
      </OverflowingText>
    );
  },
);
