import { clsx } from 'clsx';

import { IconInfoCircle } from '@ui/icon/components/TablerIcons';
import { Banner } from '@ui/primitives/feedback/Banner/Banner';
import { OverflowingTextWithTooltip } from '@ui/primitives/typography/OverflowingTextWithTooltip/OverflowingTextWithTooltip';
import { useTheme } from '@ui/theme';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './InlineBanner.module.scss';
import { InlineBannerButton } from './internal/InlineBannerButton';
import { type InlineBannerProps } from './types/InlineBannerProps';

export const InlineBanner = ({
  color = 'blue',
  message,
  variant = 'standard',
  embedded = false,
  button,
  LeftIcon = IconInfoCircle,
  className,
}: InlineBannerProps) => {
  const theme = useTheme();
  const isCompact = variant === 'compact';

  return (
    <Banner
      className={clsx(
        styles.banner,
        isCompact && styles.compact,
        isCompact &&
          (color === 'danger' ? styles.compactDanger : styles.compactBlue),
        embedded && styles.embedded,
        className,
      )}
      color={color}
      variant="secondary"
    >
      <div className={styles.bannerContent}>
        <LeftIcon size={theme.icon.size.md} />
        <div className={styles.bannerText}>
          {isCompact ? (
            message
          ) : (
            <OverflowingTextWithTooltip
              isFocusable
              text={<>{message}</>}
              tooltipContent={message}
            />
          )}
        </div>
      </div>
      {isDefined(button) && <InlineBannerButton {...button} color={color} />}
    </Banner>
  );
};
