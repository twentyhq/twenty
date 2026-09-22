import { IconInfoCircle } from '@ui/icon/components/TablerIcons';
import { type IconComponent } from '@ui/icon/types/IconComponent';
import {
  Banner,
  type BannerColor,
} from '@ui/primitives/feedback/Banner/Banner';
import { Button } from '@ui/primitives/input/Button/Button';
import { OverflowingTextWithTooltip } from '@ui/primitives/typography/OverflowingTextWithTooltip/OverflowingTextWithTooltip';
import { useTheme } from '@ui/theme-constants';
import { isDefined } from '@ui/utilities/utils/isDefined';
import { clsx } from 'clsx';

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
          size="sm"
          onClick={button?.onClick}
          disabled={button.disabled}
          startIcon={isDefined(button.Icon) ? <button.Icon /> : undefined}
          variant="outline"
          color={color === 'danger' ? 'danger' : 'accent'}
        >
          {button?.title}
        </Button>
      )}
    </Banner>
  );
};
