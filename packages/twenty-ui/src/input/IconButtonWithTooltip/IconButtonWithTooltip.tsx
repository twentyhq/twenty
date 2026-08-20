import {
  IconButton,
  type IconButtonProps,
} from '@ui/input/IconButton/IconButton';
import { AppTooltip, TooltipDelay, TooltipPosition } from '@ui/surfaces';
import { useId } from 'react';

export type IconButtonWithTooltipProps = IconButtonProps & {
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
  ...iconButtonProps
}: IconButtonWithTooltipProps) => {
  const tooltipId = useId();

  return (
    <>
      <div data-tooltip-id={tooltipId}>
        {/* oxlint-disable-next-line react/jsx-props-no-spreading */}
        <IconButton {...iconButtonProps} />
      </div>
      <AppTooltip
        anchorSelect={`[data-tooltip-id='${tooltipId}']`}
        content={tooltipContent}
        delay={tooltipDelay}
        place={tooltipPlace}
        offset={tooltipOffset}
        noArrow
      />
    </>
  );
};
