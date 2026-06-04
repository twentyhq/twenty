import { useContext } from 'react';

import IconMicrosoftCalendarImage from '@assets/icons/microsoft-calendar.png';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import { ThemeContext } from '@ui/theme-constants';

export const IconMicrosoftCalendar = ({
  className,
  size: sizeFromProps,
  style,
}: IconComponentProps) => {
  const { theme } = useContext(ThemeContext);
  const size = sizeFromProps ?? theme.icon.size.lg;

  return (
    <img
      alt=""
      className={className}
      height={size}
      src={IconMicrosoftCalendarImage}
      style={style}
      width={size}
    />
  );
};
