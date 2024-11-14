import { useTheme } from '@emotion/react';
import IllustrationIconEyeRaw from '@ui/display/icon/assets/illustration-eye.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconEyeProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconEye = (props: IllustrationIconEyeProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color } = theme.IllustrationIcon;
  return (
    <IllustrationIconEyeRaw height={size} width={size} color={color.grey} />
  );
};
