import { IconButton } from '@ui/primitives/input/IconButton/IconButton';
import { Tooltip } from '@ui/primitives/surfaces/Tooltip/Tooltip';

import { type IconButtonWithTooltipProps } from './types/IconButtonWithTooltipProps';

export const IconButtonWithTooltip = ({
  tooltipContent,
  tooltipPlace = 'bottom',
  tooltipDelay = 1000,
  tooltipOffset = 5,
  Icon,
  ariaLabel,
  onClick,
  size,
  variant,
  disabled,
}: IconButtonWithTooltipProps) => {
  const iconButton = (
    <IconButton
      Icon={Icon}
      ariaLabel={ariaLabel}
      onClick={onClick}
      size={size}
      variant={variant}
      disabled={disabled}
    />
  );

  return (
    <Tooltip
      content={tooltipContent}
      delay={tooltipDelay}
      side={tooltipPlace}
      sideOffset={tooltipOffset}
    >
      {disabled ? <div>{iconButton}</div> : iconButton}
    </Tooltip>
  );
};
