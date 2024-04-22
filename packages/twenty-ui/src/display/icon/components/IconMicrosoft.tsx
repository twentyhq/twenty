import { useTheme } from '@emotion/react';

import IconMicrosoftRaw from '../assets/microsoft.svg?react';

interface IconMicrosoftProps {
  size?: number;
}

export const IconMicrosoft = (props: IconMicrosoftProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return <IconMicrosoftRaw height={size} width={size} />;
};
