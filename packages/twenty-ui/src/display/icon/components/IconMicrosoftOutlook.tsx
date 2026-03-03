import { useContext } from 'react';

import IconMicrosoftOutlookRaw from '@assets/icons/microsoft-outlook.svg?react';
import { ThemeContext } from '@ui/theme';

interface IconMicrosoftOutlookProps {
  size?: number | string;
}

export const IconMicrosoftOutlook = (props: IconMicrosoftOutlookProps) => {
  const { theme } = useContext(ThemeContext);
  const size = props.size ?? theme.icon.size.lg;

  return <IconMicrosoftOutlookRaw height={size} width={size} />;
};
