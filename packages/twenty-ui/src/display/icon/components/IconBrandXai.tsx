import IconBrandXaiRaw from '@assets/icons/xai.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import {
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from '@ui/theme-constants';
type IconBrandXaiProps = Pick<IconComponentProps, 'size' | 'color'>;

export const IconBrandXai = (props: IconBrandXaiProps) => {
  const size =
    props.size ?? resolveThemeVariableAsNumber(themeCssVariables.icon.size.lg);

  return (
    <IconBrandXaiRaw
      height={size}
      width={size}
      color={props.color ?? 'currentColor'}
    />
  );
};
