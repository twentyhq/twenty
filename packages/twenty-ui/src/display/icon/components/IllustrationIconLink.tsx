import { useTheme } from '@emotion/react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';

import IllustrationIconLinkRaw from '@ui/display/icon/assets/illustration-link.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconLinkProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconLink = (props: IllustrationIconLinkProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color, fill } = theme.IllustrationIcon;
  return (
    <IllustrationIconWrapper>
      <IllustrationIconLinkRaw
        height={size}
        width={size}
        fill={fill.blue}
        color={color.blue}
      />
    </IllustrationIconWrapper>
  );
};
