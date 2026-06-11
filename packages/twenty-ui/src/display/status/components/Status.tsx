import { clsx } from 'clsx';

import { Loader } from '@ui/feedback/loader/components/Loader';
import { type ThemeColor } from '@ui/theme';
import { themeCssVariables } from '@ui/theme-constants';
import { parseThemeColor } from '@ui/utilities';

import styles from './Status.module.scss';

type StatusProps = {
  className?: string;
  color: ThemeColor;
  isLoaderVisible?: boolean;
  text: string;
  onClick?: () => void;
  weight?: 'regular' | 'medium';
};

export const Status = ({
  className,
  color,
  isLoaderVisible = false,
  text,
  onClick,
  weight = 'regular',
}: StatusProps) => {
  const parsedColor = parseThemeColor(color);

  return (
    <h3
      className={clsx(styles.status, styles[weight], className)}
      onClick={onClick}
      data-loader-visible={isLoaderVisible || undefined}
      style={
        {
          '--status-background': themeCssVariables.tag.background[parsedColor],
          '--status-text-color': themeCssVariables.tag.text[parsedColor],
        } as React.CSSProperties
      }
    >
      <span className={styles.content}>{text}</span>
      {isLoaderVisible ? <Loader color={color} /> : null}
    </h3>
  );
};
