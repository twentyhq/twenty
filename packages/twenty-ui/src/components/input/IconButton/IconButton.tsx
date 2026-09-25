import { useContext } from 'react';

import { ButtonGroupContext } from '@ui/primitives/input/ButtonGroup/internal/ButtonGroupContext';
import { isNonEmptyString } from '@sniptt/guards';

import { Button } from '@ui/primitives/input/Button/Button';
import { Tooltip } from '@ui/primitives/surfaces/Tooltip/Tooltip';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from './IconButton.module.scss';
import { type IconButtonProps } from './types/IconButtonProps';

export const IconButton = ({
  children,
  size = 'md',
  shape = 'square',
  className,
  tooltip,
  tooltipPlace = 'bottom',
  tooltipDelay = 1000,
  tooltipOffset = 5,
  disabled,
  loading,
  ...props
}: IconButtonProps) => {
  const buttonGroup = useContext(ButtonGroupContext);
  const resolvedSize = buttonGroup?.size ?? size;
  const hasTooltip = isNonEmptyString(tooltip);
  const isDisabled = disabled || loading;
  const button = (
    <Button
      {...props}
      size={size === 'xs' ? 'sm' : size}
      data-icon-size={resolvedSize}
      data-shape={shape}
      disabled={disabled}
      loading={loading}
      startIcon={<span className={styles.icon}>{children}</span>}
      className={mergeClassNames(styles.button, className)}
    />
  );

  if (!hasTooltip) {
    return button;
  }

  return (
    <Tooltip
      key={isDisabled ? 'disabled' : 'enabled'}
      content={tooltip}
      delay={tooltipDelay}
      side={tooltipPlace}
      sideOffset={tooltipOffset}
    >
      {isDisabled ? (
        <span className={styles.tooltipAnchor}>{button}</span>
      ) : (
        button
      )}
    </Tooltip>
  );
};
