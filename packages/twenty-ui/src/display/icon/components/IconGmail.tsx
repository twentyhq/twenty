import { useTheme } from '@emotion/react';

import IconGmailRaw from '../assets/gmail.svg?react';

interface IconGmailProps {
  size?: number;
}

export const IconGmail = (props: IconGmailProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return <IconGmailRaw height={size} width={size} />;
};
