import { clsx } from 'clsx';
import { useContext } from 'react';
import { ThemeContext } from '@ui/theme-constants';
import { Button } from '@ui/input/button/components/Button/Button';
import { type IconComponent } from '@ui/display/icon/types/IconComponent';
import { IconInfoCircle } from '@ui/display/icon/components/TablerIcons';
import { Banner, type BannerColor } from './Banner';

import styles from './InlineBanner.module.scss';

type InlineBannerProps = {
  color?: BannerColor;
  message: string;
  button?: {
    title?: string;
    onClick?: () => void;
    hidden?: boolean;
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
  const { theme } = useContext(ThemeContext);

  return (
    <Banner
      className={clsx(styles.banner, className)}
      color={color}
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
          accent={color}
          title={button?.title}
          onClick={button?.onClick}
        />
      )}
    </Banner>
  );
};
