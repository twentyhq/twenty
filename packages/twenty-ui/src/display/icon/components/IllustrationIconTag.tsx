import { useTheme } from '@emotion/react';

import IllustrationIconTagRaw from '@ui/display/icon/assets/illustration-tag.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconTagProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconTag = (props: IllustrationIconTagProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color, fill } = theme.IllustrationIcon;
  return (
    <IllustrationIconTagRaw
      height={size}
      width={size}
      fill={fill}
      color={color}
    />
  );
};
