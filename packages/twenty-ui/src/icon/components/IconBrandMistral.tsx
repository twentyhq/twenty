import IconBrandMistralRaw from '@assets/icons/mistral.svg?react';
import { type IconComponentProps } from '@ui/icon/types/IconComponent';
import { useTheme } from '@ui/theme-constants';

type IconBrandMistralProps = Pick<IconComponentProps, 'size'>;

export const IconBrandMistral = (props: IconBrandMistralProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return <IconBrandMistralRaw height={size} width={size} />;
};
