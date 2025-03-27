import { useTheme } from '@emotion/react';

import IconMicrosoftRaw from '@assets/icons/microsoft.svg?react';

interface IconMicrosoftProps {
  size?: number | string;
}

export const IconMicrosoft = (props: IconMicrosoftProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return <IconMicrosoftRaw height={size} width={size} />;
};
