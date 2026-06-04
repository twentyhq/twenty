import { useContext } from 'react';

import IconMicrosoftCalendarRaw from '@assets/icons/microsoft-calendar.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import { ThemeContext } from '@ui/theme-constants';

export const IconMicrosoftCalendar = ({
  className,
  size: sizeFromProps,
  style,
}: Pick<IconComponentProps, 'className' | 'size' | 'style'>) => {
  const { theme } = useContext(ThemeContext);
  const size = sizeFromProps ?? theme.icon.size.lg;

  return (
    <IconMicrosoftCalendarRaw
      className={className}
      height={size}
      style={style}
      width={size}
    />
  );
};
