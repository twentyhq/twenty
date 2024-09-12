import { useTheme } from '@emotion/react';

import IllustrationIconOneToManyRaw from '@ui/display/icon/assets/illustration-one-to-many.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconOneToManyProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconOneToMany = (
  props: IllustrationIconOneToManyProps,
) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color, fill } = theme.IllustrationIcon;
  return (
    <IllustrationIconOneToManyRaw
      height={size}
      width={size}
      fill={fill}
      color={color}
    />
  );
};
