import { useTheme } from '@emotion/react';

import IllustrationIconTextRaw from '@ui/display/icon/assets/illustration-text.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconTextProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconText = (props: IllustrationIconTextProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color, fill } = theme.IllustrationIcon;
  return (
    <IllustrationIconTextRaw
      height={size}
      width={size}
      fill={fill}
      color={color}
    />
  );
};
