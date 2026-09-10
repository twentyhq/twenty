import { clsx } from 'clsx';
import { OverflowingTextWithTooltip } from '@ui/surfaces/OverflowingTextWithTooltip/OverflowingTextWithTooltip';
import { useTheme } from '@ui/theme-constants';
import { Button } from '@ui/input/Button/Button';
import { type IconComponent } from '@ui/icon/types/IconComponent';
import { IconInfoCircle } from '@ui/icon/components/TablerIcons';
import { Banner, type BannerColor } from '@ui/feedback/Banner/Banner';

import styles from './InlineBanner.module.scss';

type InlineBannerProps = {
  color?: BannerColor;
  message: string;
  embedded?: boolean;
  button?: {
    title?: string;
    onClick?: () => void;
    hidden?: boolean;
    disabled?: boolean;
    Icon?: IconComponent;
  };
  LeftIcon?: IconComponent;
  className?: string;
};

export const InlineBanner = ({
  color,
  message,
  embedded = false,
  button,
  LeftIcon = IconInfoCircle,
  className,
}: InlineBannerProps) => {
  const theme = useTheme();

  return (
    <Banner
      className={clsx(styles.banner, embedded && styles.embedded, className)}
      color={color}
      variant={'secondary'}
    >
      <div className={styles.bannerContent}>
        <LeftIcon size={theme.icon.size.md} />
        <div className={styles.bannerText}>
          <OverflowingTextWithTooltip
            isFocusable
            text={<>{message}</>}
            tooltipContent={message}
          />
        </div>
      </div>
      {button && !button.hidden && (
        <Button
          size="small"
          variant="secondary"
          accent={color}
          title={button?.title}
          onClick={button?.onClick}
          disabled={button.disabled}
          Icon={button.Icon}
        />
      )}
    </Banner>
  );
};
