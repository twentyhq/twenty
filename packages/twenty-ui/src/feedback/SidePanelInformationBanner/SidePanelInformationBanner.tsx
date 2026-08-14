import { clsx } from 'clsx';
import { useId } from 'react';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { IconAlertTriangle, IconInfoCircle } from '@ui/icon';
import { AppTooltip } from '@ui/surfaces';
import { useTheme } from '@ui/theme-constants';

import styles from './SidePanelInformationBanner.module.scss';

export type SidePanelInformationBannerProps = {
  message: string;
  className?: string;
  variant?: 'default' | 'warning';
  tooltipMessage?: string;
};

export const SidePanelInformationBanner = ({
  message,
  className,
  variant = 'default',
  tooltipMessage,
}: SidePanelInformationBannerProps) => {
  const theme = useTheme();
  const tooltipId = useId();

  return (
    <div
      className={clsx(styles.banner, className)}
      data-tooltip-id={tooltipMessage ? tooltipId : undefined}
    >
      <div className={styles.iconContainer}>
        {variant === 'default' ? (
          <IconInfoCircle size={theme.icon.size.md} />
        ) : (
          <IconAlertTriangle size={theme.icon.size.md} />
        )}
      </div>
      <p className={styles.message}>{message}</p>
      {isDefined(tooltipMessage) && (
        <AppTooltip
          anchorSelect={`[data-tooltip-id='${tooltipId}']`}
          content={tooltipMessage}
          place="bottom"
        />
      )}
    </div>
  );
};
