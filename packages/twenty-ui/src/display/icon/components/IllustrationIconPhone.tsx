import { useContext } from 'react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';

import IllustrationIconPhoneRaw from '@assets/icons/illustration-phone.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import { ThemeContext } from '@ui/theme';

type IllustrationIconPhoneProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconPhone = (props: IllustrationIconPhoneProps) => {
  const { theme } = useContext(ThemeContext);
  const size = props.size ?? theme.icon.size.lg;

  return (
    <IllustrationIconWrapper>
      <IllustrationIconPhoneRaw
        height={size}
        width={size}
        fill={theme.accent.accent3}
        color={theme.accent.accent8}
      />
    </IllustrationIconWrapper>
  );
};
