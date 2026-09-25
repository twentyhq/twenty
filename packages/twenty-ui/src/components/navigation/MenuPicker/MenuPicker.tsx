import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from '@ui/utilities/utils/isDefined';
import { clsx } from 'clsx';

import { Tooltip } from '@ui/primitives/surfaces/Tooltip/Tooltip';
import { useTheme } from '@ui/theme';

import styles from './MenuPicker.module.scss';

import { type MenuPickerProps } from './types/MenuPickerProps';

export const MenuPicker = ({
  id,
  icon: Icon,
  label,
  selected = false,
  disabled = false,
  showLabel = true,
  onClick,
  className,
  testId,
  tooltipContent,
  tooltipDelay = 0,
  tooltipOffset = 5,
}: MenuPickerProps) => {
  const theme = useTheme();

  return (
    <Tooltip
      content={tooltipContent}
      disabled={!isNonEmptyString(tooltipContent)}
      sideOffset={tooltipOffset}
      side="bottom"
      positionMethod="fixed"
      delay={tooltipDelay}
    >
      <button
        id={id}
        disabled={disabled}
        onClick={onClick}
        className={clsx(styles.menuPicker, className)}
        data-testid={testId}
        data-selected={selected ? '' : undefined}
        aria-pressed={selected}
        aria-disabled={disabled}
        aria-label={label}
      >
        <div className={styles.iconContainer}>
          <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        </div>

        {isDefined(label) && showLabel && (
          <div
            className={styles.label}
            data-selected={selected ? '' : undefined}
            data-disabled={disabled ? '' : undefined}
          >
            {label}
          </div>
        )}
      </button>
    </Tooltip>
  );
};
