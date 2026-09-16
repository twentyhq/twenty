import { useId } from 'react';

import { IconButton } from '@ui/components/IconButton/IconButton';
import {
  AppTooltip,
  TooltipDelay,
  TooltipPosition,
} from '@ui/primitives/surfaces';

import { type IconButtonWithTooltipProps } from './types/IconButtonWithTooltipProps';

export const IconButtonWithTooltip = ({
  tooltipContent,
  tooltipPlace = TooltipPosition.Bottom,
  tooltipDelay = TooltipDelay.longDelay,
  tooltipOffset = 5,
  disabled,
  loading,
  ...props
}: IconButtonWithTooltipProps) => {
  const tooltipId = useId();
  const isDisabled = disabled || loading;

  return (
    <>
      <div data-tooltip-id={tooltipId}>
        <IconButton
          {...props}
          data-tooltip-trigger
          disabled={disabled}
          loading={loading}
        />
      </div>
      <AppTooltip
        anchorSelect={
          isDisabled
            ? `[data-tooltip-id='${tooltipId}']`
            : `[data-tooltip-id='${tooltipId}'] > [data-tooltip-trigger]`
        }
        title={tooltipContent}
        delay={tooltipDelay}
        place={tooltipPlace}
        offset={tooltipOffset}
        noArrow
      />
    </>
  );
};
