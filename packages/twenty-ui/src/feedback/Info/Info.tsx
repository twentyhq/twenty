import { clsx } from 'clsx';
import { IconInfoCircle } from '@ui/icon/components/TablerIcons';
import { useTheme } from '@ui/theme-constants';

import { Button } from '@ui/input/Button/Button';
import React from 'react';
import { Link } from 'react-router-dom';

import styles from './Info.module.scss';

export type InfoAccent = 'blue' | 'danger';
export type InfoProps = {
  accent?: InfoAccent;
  text: string;
  buttonTitle?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  to?: string;
};

const INFO_ACCENT_CLASS_NAMES: Record<InfoAccent, string> = {
  blue: styles.accentBlue,
  danger: styles.accentDanger,
};

export const Info = ({
  accent = 'blue',
  text,
  buttonTitle,
  onClick,
  to,
}: InfoProps) => {
  const theme = useTheme();

  return (
    <div className={clsx(styles.info, INFO_ACCENT_CLASS_NAMES[accent])}>
      <div className={styles.textContainer}>
        <IconInfoCircle size={theme.icon.size.md} />
        {text}
      </div>
      {buttonTitle && to && (
        <span className={styles.linkContainer}>
          <Link to={to}>
            <Button
              title={buttonTitle}
              size="small"
              variant="secondary"
              accent={accent}
            />
          </Link>
        </span>
      )}
      {buttonTitle && onClick && !to && (
        <Button
          title={buttonTitle}
          onClick={onClick}
          size="small"
          variant="secondary"
          accent={accent}
        />
      )}
    </div>
  );
};
