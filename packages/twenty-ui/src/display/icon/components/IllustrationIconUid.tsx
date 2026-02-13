import { useTheme } from '@emotion/react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';

import IllustrationIconUidRaw from '@assets/icons/illustration-uid.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconUidProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconUid = (props: IllustrationIconUidProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  return (
    <IllustrationIconWrapper>
      <IllustrationIconUidRaw
        height={size}
        width={size}
        fill={theme.accent.accent3}
        color={theme.accent.accent8}
      />
    </IllustrationIconWrapper>
  );
};
