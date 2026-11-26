import { isNonEmptyString } from '@sniptt/guards';
import { clsx } from 'clsx';

import { Button } from '@ui/primitives/input/Button/Button';
import { Tooltip } from '@ui/primitives/surfaces/Tooltip/Tooltip';

import styles from './ReactionButton.module.scss';
import { type ReactionButtonProps } from './types/ReactionButtonProps';

const TOOLTIP_DELAY_MS = 300;

export const ReactionButton = ({
  emoji,
  count,
  pressed,
  onPressedChange,
  onClick,
  className,
  tooltip,
  disabled,
  loading,
  ...props
}: ReactionButtonProps) => {
  const button = (
    <Button
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...props}
      type="button"
      size="sm"
      variant="ghost"
      color="neutral"
      disabled={disabled}
      loading={loading}
      aria-pressed={pressed}
      className={clsx(styles.button, className)}
      startIcon={<span className={styles.emoji}>{emoji}</span>}
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented) {
          return;
        }

        onPressedChange(!pressed);
      }}
    >
      <span aria-hidden>{count}</span>
    </Button>
  );

  if (!isNonEmptyString(tooltip)) {
    return button;
  }

  return (
    <Tooltip content={tooltip} delay={TOOLTIP_DELAY_MS}>
      {disabled || loading ? (
        <span className={styles.tooltipAnchor}>{button}</span>
      ) : (
        button
      )}
    </Tooltip>
  );
};
