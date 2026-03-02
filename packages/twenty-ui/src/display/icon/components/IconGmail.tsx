import { useContext } from 'react';

import IconGmailRaw from '@assets/icons/gmail.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import { ThemeContext } from '@ui/theme';

type IconGmailProps = Pick<IconComponentProps, 'size'>;

export const IconGmail = (props: IconGmailProps) => {
  const { theme } = useContext(ThemeContext);
  const size = props.size ?? theme.icon.size.lg;

  return <IconGmailRaw height={size} width={size} />;
};
