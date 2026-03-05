import IconGoogleRaw from '@assets/icons/google.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import {
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from '@ui/theme-constants';
type IconGoogleProps = Pick<IconComponentProps, 'size'>;

export const IconGoogle = (props: IconGoogleProps) => {
  const size =
    props.size ?? resolveThemeVariableAsNumber(themeCssVariables.icon.size.lg);

  return <IconGoogleRaw height={size} width={size} />;
};
