import { useTheme } from '@emotion/react';
import IllustrationIconMailRaw from '@ui/display/icon/assets/illustration-mail.svg?react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconMailProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconMail = (props: IllustrationIconMailProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color, fill } = theme.IllustrationIcon;
  return (
    <IllustrationIconWrapper>
      <IllustrationIconMailRaw
        height={size}
        width={size}
        fill={fill.blue}
        color={color.blue}
      />
    </IllustrationIconWrapper>
  );
};
