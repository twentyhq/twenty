import { useJsonTreeContextOrThrow } from '@ui/components/JsonTree/internal/hooks/useJsonTreeContextOrThrow';
import { IconChevronDown } from '@ui/icon';
import { VisibilityHidden } from '@ui/primitives/accessibility/components/VisibilityHidden';
import { themeCssVariables, useTheme } from '@ui/theme-constants';
import { clsx } from 'clsx';

import styles from './JsonArrow.module.scss';

export const JsonArrow = ({
  isOpen,
  onClick,
  variant,
}: {
  isOpen: boolean;
  onClick: () => void;
  variant?: 'blue' | 'red';
}) => {
  const theme = useTheme();
  const { arrowButtonCollapsedLabel, arrowButtonExpandedLabel } =
    useJsonTreeContextOrThrow();

  const iconColor =
    variant === 'blue'
      ? themeCssVariables.color.blue
      : variant === 'red'
        ? themeCssVariables.font.color.danger
        : themeCssVariables.font.color.secondary;

  return (
    <button
      className={clsx(styles.button, variant === 'red' && styles.red)}
      onClick={onClick}
    >
      <VisibilityHidden>
        {isOpen ? arrowButtonExpandedLabel : arrowButtonCollapsedLabel}
      </VisibilityHidden>

      <div className={styles.chevron} data-open={isOpen || undefined}>
        <IconChevronDown size={theme.icon.size.md} color={iconColor} />
      </div>
    </button>
  );
};
