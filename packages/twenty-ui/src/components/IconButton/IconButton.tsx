import { isNonEmptyString } from '@sniptt/guards';
import { useId } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';
import {
  AppTooltip,
  TooltipDelay,
  TooltipPosition,
} from '@ui/primitives/surfaces/AppTooltip/AppTooltip';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from './IconButton.module.scss';
import { type IconButtonProps } from './types/IconButtonProps';

export const IconButton = ({
  children,
  className,
  tooltip,
  tooltipPlace = TooltipPosition.Bottom,
  tooltipDelay = TooltipDelay.longDelay,
  tooltipOffset = 5,
  disabled,
  loading,
  ...props
}: IconButtonProps) => {
  const tooltipId = useId();
  const hasTooltip = isNonEmptyString(tooltip);
  const isDisabled = disabled || loading;
  const button = (
    <Button
      {...props}
      disabled={disabled}
      loading={loading}
      data-tooltip-trigger={hasTooltip || undefined}
      startIcon={<span className={styles.icon}>{children}</span>}
      className={mergeClassNames(styles.button, className)}
    />
  );

  if (!hasTooltip) {
    return button;
  }

  return (
    <>
      <span className={styles.tooltipAnchor} data-tooltip-id={tooltipId}>
        {button}
      </span>
      <AppTooltip
        anchorSelect={
          isDisabled
            ? `[data-tooltip-id='${tooltipId}']`
            : `[data-tooltip-id='${tooltipId}'] > [data-tooltip-trigger]`
        }
        title={tooltip}
        delay={tooltipDelay}
        place={tooltipPlace}
        offset={tooltipOffset}
        noArrow
      />
    </>
  );
};
