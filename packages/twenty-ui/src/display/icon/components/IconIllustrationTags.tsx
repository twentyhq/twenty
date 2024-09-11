import { useTheme } from '@emotion/react';

import IconIllustrationTagsRaw from '@ui/display/icon/assets/illustration-tags.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconIllustrationTagsProps = Pick<IconComponentProps, 'size'>;

export const IconIllustrationTags = (props: IconIllustrationTagsProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const illustrationColors = theme.iconIllustration;

  return (
    <IconIllustrationTagsRaw
      height={size}
      width={size}
      fill={illustrationColors.fill}
      color={illustrationColors.color}
    />
  );
};
