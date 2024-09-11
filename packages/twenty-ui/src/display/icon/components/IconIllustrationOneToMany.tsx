import { useTheme } from '@emotion/react';

import IconIllustrationOneToManyRaw from '@ui/display/icon/assets/illustration-one-to-many.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconIllustrationOneToManyProps = Pick<IconComponentProps, 'size'>;

export const IconIllustrationOneToMany = (
  props: IconIllustrationOneToManyProps,
) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const illustrationColors = theme.iconIllustration;

  return (
    <IconIllustrationOneToManyRaw
      height={size}
      width={size}
      fill={illustrationColors.fill}
      color={illustrationColors.color}
    />
  );
};
