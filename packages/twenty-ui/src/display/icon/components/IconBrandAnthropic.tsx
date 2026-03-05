import IconAnthropicRaw from '@assets/icons/anthropic.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import {
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from '@ui/theme-constants';
type IconBrandAnthropicProps = Pick<IconComponentProps, 'size' | 'color'>;

export const IconBrandAnthropic = (props: IconBrandAnthropicProps) => {
  const size =
    props.size ?? resolveThemeVariableAsNumber(themeCssVariables.icon.size.lg);

  return (
    <IconAnthropicRaw
      height={size}
      width={size}
      color={props.color ?? 'currentColor'}
    />
  );
};
