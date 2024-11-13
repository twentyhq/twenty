import { useTheme } from '@emotion/react';

import IllustrationIconLink2Raw from '@ui/display/icon/assets/illustration-link2.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconLink2Props = Pick<IconComponentProps, 'size'>;

export const IllustrationIconLink2 = (props: IllustrationIconLink2Props) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color } = theme.IllustrationIcon;
  return (
    <IllustrationIconLink2Raw width={size} height={size} color={color.grey} />
  );
};
