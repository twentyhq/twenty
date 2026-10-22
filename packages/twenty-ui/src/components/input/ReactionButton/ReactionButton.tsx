import { clsx } from 'clsx';

import { Button } from '@ui/primitives/input/Button/Button';

import styles from './ReactionButton.module.scss';
import { type ReactionButtonProps } from './types/ReactionButtonProps';

export const ReactionButton = ({
  emoji,
  count,
  pressed,
  onPressedChange,
  onClick,
  className,
  ...props
}: ReactionButtonProps) => (
  <Button
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...props}
    type="button"
    size="sm"
    variant="ghost"
    color="neutral"
    aria-pressed={pressed}
    className={clsx(styles.button, className)}
    onClick={(event) => {
      onClick?.(event);

      if (event.defaultPrevented) {
        return;
      }

      onPressedChange(!pressed);
    }}
  >
    <span className={styles.content} aria-hidden>
      <span className={styles.emoji}>{emoji}</span>
      <span>{count}</span>
    </span>
  </Button>
);
