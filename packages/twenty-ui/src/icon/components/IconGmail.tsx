import IconGmailRaw from '@assets/icons/gmail.svg?react';
import { type IconComponentProps } from '@ui/icon/types/IconComponent';
import { useTheme } from '@ui/theme-constants';

type IconGmailProps = Pick<IconComponentProps, 'size'>;

export const IconGmail = (props: IconGmailProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return <IconGmailRaw height={size} width={size} />;
};
