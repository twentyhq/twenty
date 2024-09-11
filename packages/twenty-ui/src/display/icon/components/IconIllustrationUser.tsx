import { useTheme } from '@emotion/react';

import IconIllustrationUserRaw from '@ui/display/icon/assets/illustration-user.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconIllustrationUserProps = Pick<IconComponentProps, 'size'>;

export const IconIllustrationUser = (props: IconIllustrationUserProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const illustrationColors = theme.iconIllustration;

  return (
    <IconIllustrationUserRaw
      height={size}
      width={size}
      fill={illustrationColors.fill}
      color={illustrationColors.color}
    />
  );
};
