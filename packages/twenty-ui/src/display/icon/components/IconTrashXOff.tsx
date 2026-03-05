import IconTrashXOffRaw from '@assets/icons/trash-x-off.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import {
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from '@ui/theme-constants';
type IconTrashXOffProps = Pick<IconComponentProps, 'size' | 'stroke'>;

export const IconTrashXOff = (props: IconTrashXOffProps) => {
  const size =
    props.size ?? resolveThemeVariableAsNumber(themeCssVariables.icon.size.lg);
  const stroke =
    props.stroke ??
    resolveThemeVariableAsNumber(themeCssVariables.icon.stroke.md);

  return <IconTrashXOffRaw height={size} width={size} strokeWidth={stroke} />;
};
