import { useTheme } from '@emotion/react';

import IconIllustrationTagRaw from '@ui/display/icon/assets/illustration-tag.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconIllustrationTagProps = Pick<IconComponentProps, 'size'>;

export const IconIllustrationTag = (props: IconIllustrationTagProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const illustrationColors = theme.iconIllustration;

  return (
    <IconIllustrationTagRaw
      height={size}
      width={size}
      fill={illustrationColors.fill}
      color={illustrationColors.color}
    />
  );
};
