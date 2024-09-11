import { useTheme } from '@emotion/react';

import IconIllustrationMailRaw from '@ui/display/icon/assets/illustration-mail.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconIllustrationMailProps = Pick<IconComponentProps, 'size'>;

export const IconIllustrationMail = (props: IconIllustrationMailProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const illustrationColors = theme.iconIllustration;

  return (
    <IconIllustrationMailRaw
      height={size}
      width={size}
      fill={illustrationColors.fill}
      color={illustrationColors.color}
    />
  );
};
