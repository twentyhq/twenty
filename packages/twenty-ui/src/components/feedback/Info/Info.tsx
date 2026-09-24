import { IconInfoCircle } from '@ui/icon/components/TablerIcons';
import { useTheme } from '@ui/theme';
import { clsx } from 'clsx';
import { type InfoAccent } from './types/InfoAccent';
import { type InfoProps } from './types/InfoProps';

import { Button } from '@ui/primitives/input/Button/Button';

import styles from './Info.module.scss';

const INFO_ACCENT_CLASS_NAMES: Record<InfoAccent, string> = {
  blue: styles.accentBlue,
  danger: styles.accentDanger,
};

export const Info = ({
  accent = 'blue',
  text,
  buttonTitle,
  onClick,
  href,
  render,
}: InfoProps) => {
  const theme = useTheme();

  return (
    <div className={clsx(styles.info, INFO_ACCENT_CLASS_NAMES[accent])}>
      <div className={styles.textContainer}>
        <IconInfoCircle size={theme.icon.size.md} />
        {text}
      </div>
      {buttonTitle && href && (
        <span className={styles.linkContainer}>
          <Button
            href={href}
            render={render}
            size="sm"
            variant="outline"
            color={accent === 'blue' ? 'accent' : 'danger'}
          >
            {buttonTitle}
          </Button>
        </span>
      )}
      {buttonTitle && onClick && !href && (
        <Button
          onClick={onClick}
          size="sm"
          variant="outline"
          color={accent === 'blue' ? 'accent' : 'danger'}
        >
          {buttonTitle}
        </Button>
      )}
    </div>
  );
};
