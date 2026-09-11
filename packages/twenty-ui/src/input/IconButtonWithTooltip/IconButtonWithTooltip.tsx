import {
  IconButton,
  type IconButtonProps,
} from '@ui/input/IconButton/IconButton';
import { AppTooltip, TooltipDelay, TooltipPosition } from '@ui/surfaces';
import { useId } from 'react';

export type IconButtonWithTooltipProps = Pick<
  IconButtonProps,
  'Icon' | 'ariaLabel' | 'onClick' | 'size' | 'variant' | 'disabled'
> & {
  tooltipContent: string;
  tooltipPlace?: TooltipPosition;
  tooltipDelay?: TooltipDelay;
  tooltipOffset?: number;
};

export const IconButtonWithTooltip = ({
  tooltipContent,
  tooltipPlace = TooltipPosition.Bottom,
  tooltipDelay = TooltipDelay.longDelay,
  tooltipOffset = 5,
  Icon,
  ariaLabel,
  onClick,
  size,
  variant,
  disabled,
}: IconButtonWithTooltipProps) => {
  const tooltipId = useId();

  return (
    <>
      <div data-tooltip-id={tooltipId}>
        <IconButton
          Icon={Icon}
          ariaLabel={ariaLabel}
          onClick={onClick}
          size={size}
          variant={variant}
          disabled={disabled}
        />
      </div>
      <AppTooltip
        anchorSelect={
          disabled
            ? `[data-tooltip-id='${tooltipId}']`
            : `[data-tooltip-id='${tooltipId}'] > button`
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
