import { isNonEmptyString } from '@sniptt/guards';
import { clsx } from 'clsx';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { type IconComponent } from '@ui/icon';
import { AppTooltip, TooltipDelay, TooltipPosition } from '@ui/surfaces';
import { useTheme } from '@ui/theme-constants';

import styles from './MenuPicker.module.scss';

export type MenuPickerProps = {
  id: string;
  className?: string;
  disabled?: boolean;
  icon: IconComponent;
  label?: string;
  onClick?: () => void;
  selected?: boolean;
  showLabel?: boolean;
  testId?: string;
  tooltipContent?: string;
  tooltipDelay?: TooltipDelay;
  tooltipOffset?: number;
};

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
  tooltipDelay = TooltipDelay.noDelay,
  tooltipOffset = 5,
}: MenuPickerProps) => {
  const theme = useTheme();

  return (
    <>
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

      {isNonEmptyString(tooltipContent) && (
        <AppTooltip
          anchorSelect={`#${id}`}
          offset={tooltipOffset}
          content={tooltipContent}
          place={TooltipPosition.Bottom}
          positionStrategy="fixed"
          delay={tooltipDelay}
          noArrow
        />
      )}
    </>
  );
};
