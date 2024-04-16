import { useTheme } from '@emotion/react';

import IconGoogleRaw from '@ui/display/icon/assets/google.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconGoogleProps = Pick<IconComponentProps, 'size'>;

export const IconGoogle = (props: IconGoogleProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return <IconGoogleRaw height={size} width={size} />;
};
