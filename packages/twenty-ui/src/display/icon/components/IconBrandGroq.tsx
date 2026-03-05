import IconBrandGroqRaw from '@assets/icons/groq.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import {
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from '@ui/theme-constants';
type IconBrandGroqProps = Pick<IconComponentProps, 'size' | 'color'>;

export const IconBrandGroq = (props: IconBrandGroqProps) => {
  const size =
    props.size ?? resolveThemeVariableAsNumber(themeCssVariables.icon.size.lg);

  return (
    <IconBrandGroqRaw
      height={size}
      width={size}
      color={props.color ?? 'currentColor'}
    />
  );
};
