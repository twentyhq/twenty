import { useTheme } from '@emotion/react';

import IconIllustrationToggleRaw from '@ui/display/icon/assets/illustration-toggle.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconIllustrationToggleProps = Pick<IconComponentProps, 'size'>;

export const IconIllustrationToggle = (props: IconIllustrationToggleProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const illustrationColors = theme.iconIllustration;

  return (
    <IconIllustrationToggleRaw
      height={size}
      width={size}
      fill={illustrationColors.fill}
      color={illustrationColors.color}
    />
  );
};
