import {
  IconButton,
  type IconButtonProps,
} from '@ui/input/IconButton/IconButton';
import { AppTooltip, TooltipDelay, TooltipPosition } from '@ui/surfaces';

export type IconButtonWithTooltipProps = IconButtonProps & {
  tooltipId: string;
  tooltipContent: string;
  tooltipPlace?: TooltipPosition;
  tooltipDelay?: TooltipDelay;
  tooltipOffset?: number;
};

export const IconButtonWithTooltip = ({
  tooltipId,
  tooltipContent,
  tooltipPlace = TooltipPosition.Bottom,
  tooltipDelay = TooltipDelay.longDelay,
  tooltipOffset = 5,
  ...iconButtonProps
}: IconButtonWithTooltipProps) => (
  <>
    <div id={tooltipId}>
      {/* oxlint-disable-next-line react/jsx-props-no-spreading */}
      <IconButton {...iconButtonProps} />
    </div>
    <AppTooltip
      anchorSelect={`#${tooltipId}`}
      content={tooltipContent}
      delay={tooltipDelay}
      place={tooltipPlace}
      offset={tooltipOffset}
      noArrow
    />
  </>
);
