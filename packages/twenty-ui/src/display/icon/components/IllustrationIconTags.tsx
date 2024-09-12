import { useTheme } from '@emotion/react';

import IllustrationIconTagsRaw from '@ui/display/icon/assets/illustration-tags.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconTagsProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconTags = (props: IllustrationIconTagsProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color, fill } = theme.IllustrationIcon;
  return (
    <IllustrationIconTagsRaw
      height={size}
      width={size}
      fill={fill}
      color={color}
    />
  );
};
