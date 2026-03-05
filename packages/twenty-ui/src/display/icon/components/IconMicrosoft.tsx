import IconMicrosoftRaw from '@assets/icons/microsoft.svg?react';
import {
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from '@ui/theme-constants';
interface IconMicrosoftProps {
  size?: number | string;
}

export const IconMicrosoft = (props: IconMicrosoftProps) => {
  const size =
    props.size ?? resolveThemeVariableAsNumber(themeCssVariables.icon.size.lg);

  return <IconMicrosoftRaw height={size} width={size} />;
};
