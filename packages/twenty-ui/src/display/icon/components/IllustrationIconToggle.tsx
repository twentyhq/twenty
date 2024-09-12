import { useTheme } from '@emotion/react';

import IllustrationIconToggleRaw from '@ui/display/icon/assets/illustration-toggle.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconToggleProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconToggle = (props: IllustrationIconToggleProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color, fill } = theme.IllustrationIcon;
  return (
    <IllustrationIconToggleRaw
      height={size}
      width={size}
      fill={fill}
      color={color}
    />
  );
};
