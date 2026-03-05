import IconBrandMistralRaw from '@assets/icons/mistral.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import {
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from '@ui/theme-constants';
type IconBrandMistralProps = Pick<IconComponentProps, 'size' | 'color'>;

export const IconBrandMistral = (props: IconBrandMistralProps) => {
  const size =
    props.size ?? resolveThemeVariableAsNumber(themeCssVariables.icon.size.lg);

  return (
    <IconBrandMistralRaw
      height={size}
      width={size}
      color={props.color ?? 'currentColor'}
    />
  );
};
