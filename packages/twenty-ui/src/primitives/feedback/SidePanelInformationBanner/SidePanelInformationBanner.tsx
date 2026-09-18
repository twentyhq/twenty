import { clsx } from 'clsx';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { IconAlertTriangle, IconInfoCircle } from '@ui/icon';
import { Tooltip } from '@ui/primitives/surfaces/Tooltip/Tooltip';

import styles from './SidePanelInformationBanner.module.scss';

import { type SidePanelInformationBannerProps } from './types/SidePanelInformationBannerProps';

export const SidePanelInformationBanner = ({
  message,
  className,
  variant = 'default',
  tooltipMessage,
}: SidePanelInformationBannerProps) => {
  return (
    <Tooltip
      content={tooltipMessage}
      disabled={!isDefined(tooltipMessage)}
      side="bottom"
      delay={500}
    >
      <div className={clsx(styles.banner, className)}>
        <div className={styles.iconContainer}>
          {variant === 'default' ? (
            <IconInfoCircle size={16} />
          ) : (
            <IconAlertTriangle size={16} />
          )}
        </div>
        <p className={styles.message}>{message}</p>
      </div>
    </Tooltip>
  );
};
