import { useTheme } from '@emotion/react';

import IconMicrosoftOutlookRaw from '../assets/microsoft-outlook.svg?react';

interface IconMicrosoftOutlookProps {
  size?: number;
}

export const IconMicrosoftOutlook = (props: IconMicrosoftOutlookProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return <IconMicrosoftOutlookRaw height={size} width={size} />;
};
