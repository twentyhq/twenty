import { useContext } from 'react';

import IconMicrosoftRaw from '@assets/icons/microsoft.svg?react';
import { ThemeContext } from '@ui/theme';

interface IconMicrosoftProps {
  size?: number | string;
}

export const IconMicrosoft = (props: IconMicrosoftProps) => {
  const { theme } = useContext(ThemeContext);
  const size = props.size ?? theme.icon.size.lg;

  return <IconMicrosoftRaw height={size} width={size} />;
};
