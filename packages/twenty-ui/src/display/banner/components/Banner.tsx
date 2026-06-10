import { clsx } from 'clsx';

import styles from './Banner.module.scss';

export type BannerColor = 'blue' | 'danger';

export type BannerVariant = 'primary' | 'secondary';

const BANNER_VARIANT_COLOR_CLASS_NAMES = {
  primary: {
    blue: styles.primaryBlue,
    danger: styles.primaryDanger,
  },
  secondary: {
    blue: styles.secondaryBlue,
    danger: styles.secondaryDanger,
  },
} as const;

type BannerProps = {
  color?: BannerColor;
  variant?: BannerVariant;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

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
