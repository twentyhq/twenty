import IconMicrosoftOutlookRaw from '@assets/icons/microsoft-outlook.svg?react';
import { useTheme } from '@ui/theme-constants';

interface IconMicrosoftOutlookProps {
  size?: number | string;
}

export const IconMicrosoftOutlook = (props: IconMicrosoftOutlookProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return <IconMicrosoftOutlookRaw height={size} width={size} />;
};
