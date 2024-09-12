import { useTheme } from '@emotion/react';

import IllustrationIconLinkRaw from '@ui/display/icon/assets/illustration-link.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconLinkProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconLink = (props: IllustrationIconLinkProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color, fill } = theme.IllustrationIcon;
  return (
    <IllustrationIconLinkRaw
      height={size}
      width={size}
      fill={fill}
      color={color}
    />
  );
};
