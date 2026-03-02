import IllustrationIconMailRaw from '@assets/icons/illustration-mail.svg?react';
import { useContext } from 'react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import { ThemeContext } from '@ui/theme';

type IllustrationIconMailProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconMail = (props: IllustrationIconMailProps) => {
  const { theme } = useContext(ThemeContext);
  const size = props.size ?? theme.icon.size.lg;
  return (
    <IllustrationIconWrapper>
      <IllustrationIconMailRaw
        height={size}
        width={size}
        fill={theme.accent.accent3}
        color={theme.accent.accent8}
      />
    </IllustrationIconWrapper>
  );
};
