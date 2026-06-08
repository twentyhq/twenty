import { useContext } from 'react';

import IconBrandGeminiRaw from '@assets/icons/gemini.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import { ThemeContext } from '@ui/theme-constants';

type IconBrandGeminiProps = Pick<IconComponentProps, 'size'>;

export const IconBrandGemini = (props: IconBrandGeminiProps) => {
  const { theme } = useContext(ThemeContext);
  const size = props.size ?? theme.icon.size.lg;

  return <IconBrandGeminiRaw height={size} width={size} />;
};
