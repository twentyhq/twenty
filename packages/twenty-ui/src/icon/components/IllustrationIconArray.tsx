import IllustrationIconArrayRaw from '@assets/icons/illustration-array.svg?react';
import { IllustrationIconWrapper } from '@ui/icon/components/IllustrationIconWrapper';
import { type IconComponentProps } from '@ui/icon/types/IconComponent';
import { useTheme } from '@ui/theme-constants';

type IllustrationIconArrayProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconArray = (props: IllustrationIconArrayProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  return (
    <IllustrationIconWrapper>
      <IllustrationIconArrayRaw
        fill={theme.accent.accent3}
        color={theme.accent.accent8}
        height={size}
        width={size}
      />
    </IllustrationIconWrapper>
  );
};
