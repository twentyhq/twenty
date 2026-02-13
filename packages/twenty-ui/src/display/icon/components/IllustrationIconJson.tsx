import { useTheme } from '@emotion/react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';

import IllustrationIconJsonRaw from '@assets/icons/illustration-json.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconJsonProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconJson = (props: IllustrationIconJsonProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  return (
    <IllustrationIconWrapper>
      <IllustrationIconJsonRaw
        height={size}
        width={size}
        fill={theme.accent.accent3}
        color={theme.accent.accent8}
      />
    </IllustrationIconWrapper>
  );
};
