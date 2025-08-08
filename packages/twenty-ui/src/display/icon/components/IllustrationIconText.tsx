import { useTheme } from '@emotion/react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';

import IllustrationIconTextRaw from '@assets/icons/illustration-text.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconTextProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconText = (props: IllustrationIconTextProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color, fill } = theme.IllustrationIcon;
  return (
    <IllustrationIconWrapper>
      <IllustrationIconTextRaw
        height={size}
        width={size}
        fill={fill.blue}
        color={color.blue}
      />
    </IllustrationIconWrapper>
  );
};
