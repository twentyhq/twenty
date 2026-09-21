import { clsx } from 'clsx';

import styles from './Banner.module.scss';

export type BannerColor = 'blue' | 'gray' | 'danger';

export type BannerVariant = 'primary' | 'secondary';

const BANNER_VARIANT_COLOR_CLASS_NAMES = {
  primary: {
    blue: styles.primaryBlue,
    gray: styles.primaryGray,
    danger: styles.primaryDanger,
  },
  secondary: {
    blue: styles.secondaryBlue,
    gray: styles.secondaryGray,
    danger: styles.secondaryDanger,
  },
} as const;

type BannerProps = {
  color?: BannerColor;
  variant?: BannerVariant;
  className?: string;
  children: React.ReactNode;
};

export const Banner = ({
  color = 'blue',
  variant = 'primary',
  className,
  children,
}: BannerProps) => {
  return (
    <div
      className={clsx(
        styles.banner,
        BANNER_VARIANT_COLOR_CLASS_NAMES[variant][color],
        className,
      )}
    >
      {children}
    </div>
  );
};
