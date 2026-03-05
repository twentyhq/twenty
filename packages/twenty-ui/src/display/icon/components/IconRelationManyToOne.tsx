import IconRelationManyToOneRaw from '@assets/icons/many-to-one.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import {
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from '@ui/theme-constants';
type IconRelationManyToOneProps = Pick<IconComponentProps, 'size' | 'stroke'>;

export const IconRelationManyToOne = (props: IconRelationManyToOneProps) => {
  const size = props.size ?? 24;
  const stroke =
    props.stroke ??
    resolveThemeVariableAsNumber(themeCssVariables.icon.stroke.md);

  return (
    <IconRelationManyToOneRaw height={size} width={size} strokeWidth={stroke} />
  );
};
