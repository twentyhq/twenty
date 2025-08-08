import IllustrationIconArrayRaw from '@assets/icons/illustration-array.svg?react';
import { useTheme } from '@emotion/react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
type IllustrationIconArrayProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconArray = (props: IllustrationIconArrayProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color, fill } = theme.IllustrationIcon;
  return (
    <IllustrationIconWrapper>
      <IllustrationIconArrayRaw
        fill={fill.blue}
        color={color.blue}
        height={size}
        width={size}
      />
    </IllustrationIconWrapper>
  );
};
