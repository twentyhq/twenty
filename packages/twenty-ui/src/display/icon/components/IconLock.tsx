import IconLockRaw from '@assets/icons/lock.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import {
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from '@ui/theme-constants';
type IconLockCustomProps = Pick<IconComponentProps, 'size'>;

export const IconLockCustom = (props: IconLockCustomProps) => {
  const size =
    props.size ?? resolveThemeVariableAsNumber(themeCssVariables.icon.size.lg);

  return <IconLockRaw height={size} width={size} />;
};
