import { useTheme } from '@emotion/react';

import IconGmailRaw from '@ui/display/icon/assets/gmail.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconGmailProps = Pick<IconComponentProps, 'size'>;

export const IconGmail = (props: IconGmailProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return <IconGmailRaw height={size} width={size} />;
};
