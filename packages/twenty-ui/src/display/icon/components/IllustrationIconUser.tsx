import { useTheme } from '@emotion/react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';

import IllustrationIconUserRaw from '@ui/display/icon/assets/illustration-user.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconUserProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconUser = (props: IllustrationIconUserProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color, fill } = theme.IllustrationIcon;
  return (
    <IllustrationIconWrapper>
      <IllustrationIconUserRaw
        height={size}
        width={size}
        fill={fill.blue}
        color={color.blue}
      />
    </IllustrationIconWrapper>
  );
};
