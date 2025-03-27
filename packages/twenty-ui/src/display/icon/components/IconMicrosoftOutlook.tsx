import { useTheme } from '@emotion/react';

import IconMicrosoftOutlookRaw from '@assets/icons/microsoft-outlook.svg?react';

interface IconMicrosoftOutlookProps {
  size?: number | string;
}

export const IconMicrosoftOutlook = (props: IconMicrosoftOutlookProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return <IconMicrosoftOutlookRaw height={size} width={size} />;
};
