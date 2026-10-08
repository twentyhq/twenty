import { isString } from '@sniptt/guards';
import { clsx } from 'clsx';

import { IconInfoCircle } from '@ui/icon/components/TablerIcons';
import { Banner } from '@ui/primitives/feedback/Banner/Banner';
import { OverflowingTextWithTooltip } from '@ui/primitives/typography/OverflowingTextWithTooltip/OverflowingTextWithTooltip';
import { isRenderableSlot } from '@ui/utilities/internal/isRenderableSlot';

import styles from '../InlineBanner.module.scss';
import { type InlineBannerProps } from '../types/InlineBannerProps';

export const InlineBannerComponent = ({
  children,
  layout = 'standard',
  variant = 'soft',
  embedded = false,
  icon = <IconInfoCircle aria-hidden="true" />,
  className,
  ...props
}: InlineBannerProps) => {
  const isCompact = layout === 'compact';
  const shouldTruncateText = !isCompact && isString(children);

  return (
    <Banner
      {...props}
      className={clsx(
        styles.banner,
        isCompact && styles.compact,
        embedded && styles.embedded,
        className,
      )}
      variant={variant}
      data-layout={layout}
    >
      <div className={styles.bannerContent}>
        {isRenderableSlot(icon) && <span className={styles.icon}>{icon}</span>}
        <div className={styles.bannerText}>
          {shouldTruncateText ? (
            <OverflowingTextWithTooltip
              isFocusable
              text={<>{children}</>}
              tooltipContent={children}
            />
          ) : (
            children
          )}
        </div>
      </div>
    </Banner>
  );
};
