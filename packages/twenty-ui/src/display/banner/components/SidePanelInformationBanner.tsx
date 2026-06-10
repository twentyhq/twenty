import { clsx } from 'clsx';
import { isDefined } from '@ui/utilities/utils/isDefined';

import {
  IconAlertTriangle,
  IconInfoCircle,
} from '../../icon/components/TablerIcons';
import { AppTooltip } from '../../tooltip/AppTooltip';

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
  const tooltipId = 'side-panel-information-banner-tooltip';

  return (
    <div
      className={clsx(styles.banner, className)}
      data-tooltip-id={tooltipMessage ? tooltipId : undefined}
    >
      <div className={styles.iconContainer}>
        {variant === 'default' ? (
          <IconInfoCircle size={16} />
        ) : (
          <IconAlertTriangle size={16} />
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
