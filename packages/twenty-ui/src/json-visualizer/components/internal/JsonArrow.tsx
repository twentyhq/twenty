import { VisibilityHidden } from '@ui/accessibility';
import { IconChevronDown } from '@ui/display';
import { useJsonTreeContextOrThrow } from '@ui/json-visualizer/hooks/useJsonTreeContextOrThrow';
import { ThemeContext, themeCssVariables } from '@ui/theme-constants';
import { clsx } from 'clsx';
import { useContext } from 'react';

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
  const { theme } = useContext(ThemeContext);
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
