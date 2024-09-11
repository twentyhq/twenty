import { useTheme } from '@emotion/react';

import IconIllustrationPhoneRaw from '@ui/display/icon/assets/illustration-phone.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconIllustrationPhoneProps = Pick<IconComponentProps, 'size'>;

export const IconIllustrationPhone = (props: IconIllustrationPhoneProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const illustrationColors = theme.iconIllustration;

  return (
    <IconIllustrationPhoneRaw
      height={size}
      width={size}
      fill={illustrationColors.fill}
      color={illustrationColors.color}
    />
  );
};
