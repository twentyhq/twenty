import { useTheme } from '@emotion/react';

import IconMicrosoftRaw from '../assets/microsoft.svg?react';

interface IconMicrosoftOutlookProps {
  size?: number;
}

export const IconMicrosoftOutlook = (props: IconMicrosoftOutlookProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return <IconMicrosoftRaw height={size} width={size} />;
};
