import { useTheme } from '@emotion/react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';

import IllustrationIconTagRaw from '@ui/display/icon/assets/illustration-tag.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconTagProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconTag = (props: IllustrationIconTagProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color, fill } = theme.IllustrationIcon;
  return (
    <IllustrationIconWrapper>
      <IllustrationIconTagRaw
        height={size}
        width={size}
        fill={fill.blue}
        color={color.blue}
      />
    </IllustrationIconWrapper>
  );
};
