import { useTheme } from '@emotion/react';

import IconIllustrationUidRaw from '@ui/display/icon/assets/illustration-uid.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconIllustrationUidProps = Pick<IconComponentProps, 'size'>;

export const IconIllustrationUid = (props: IconIllustrationUidProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const illustrationColors = theme.iconIllustration;

  return (
    <IconIllustrationUidRaw
      height={size}
      width={size}
      fill={illustrationColors.fill}
      color={illustrationColors.color}
    />
  );
};
