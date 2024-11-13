import { useTheme } from '@emotion/react';

import IllustrationIconCheckRaw from '@ui/display/icon/assets/illustration-check.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconCheckProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconCheck = (props: IllustrationIconCheckProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color } = theme.IllustrationIcon;
  return (
    <IllustrationIconCheckRaw width={size} height={size} color={color.grey} />
  );
};
