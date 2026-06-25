import IconBrandGeminiRaw from '@assets/icons/gemini.svg?react';
import { type IconComponentProps } from '@ui/icon/types/IconComponent';
import { useTheme } from '@ui/theme-constants';

type IconBrandGeminiProps = Pick<IconComponentProps, 'size'>;

export const IconBrandGemini = (props: IconBrandGeminiProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return <IconBrandGeminiRaw height={size} width={size} />;
};
