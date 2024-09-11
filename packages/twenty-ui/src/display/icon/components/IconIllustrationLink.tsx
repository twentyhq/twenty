import { useTheme } from '@emotion/react';

import IconIllustrationLinkRaw from '@ui/display/icon/assets/illustration-link.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconIllustrationLinkProps = Pick<IconComponentProps, 'size'>;

export const IconIllustrationLink = (props: IconIllustrationLinkProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const illustrationColors = theme.iconIllustration;

  return (
    <IconIllustrationLinkRaw
      height={size}
      width={size}
      fill={illustrationColors.fill}
      color={illustrationColors.color}
    />
  );
};
