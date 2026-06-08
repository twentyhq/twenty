import { useContext } from 'react';

import IconModelClaudeRaw from '@assets/icons/claude.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import { ThemeContext } from '@ui/theme-constants';

type IconModelClaudeProps = Pick<IconComponentProps, 'size'>;

export const IconModelClaude = (props: IconModelClaudeProps) => {
  const { theme } = useContext(ThemeContext);
  const size = props.size ?? theme.icon.size.lg;

  return <IconModelClaudeRaw height={size} width={size} />;
};
