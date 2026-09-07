import { clsx } from 'clsx';
import { useTheme } from '@ui/theme-constants';
import { Button } from '@ui/input/Button/Button';
import { type IconComponent } from '@ui/icon/types/IconComponent';
import { IconInfoCircle } from '@ui/icon/components/TablerIcons';
import { Banner, type BannerColor } from '@ui/feedback/Banner/Banner';

import styles from './InlineBanner.module.scss';

type InlineBannerProps = {
  color?: BannerColor | 'gray';
  message: string;
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
  button,
  LeftIcon = IconInfoCircle,
  className,
}: InlineBannerProps) => {
  const theme = useTheme();

  return (
    <Banner
      className={clsx(
        styles.banner,
        color === 'gray' && styles.gray,
        className,
      )}
      color={color === 'gray' ? undefined : color}
      variant={'secondary'}
    >
      <div className={styles.bannerContent}>
        <LeftIcon size={theme.icon.size.md} />
        <span className={styles.bannerText}>{message}</span>
      </div>
      {button && !button.hidden && (
        <Button
          size="small"
          variant="secondary"
          accent={color === 'gray' ? 'default' : color}
          title={button?.title}
          onClick={button?.onClick}
          disabled={button.disabled}
          Icon={button.Icon}
        />
      )}
    </Banner>
  );
};
