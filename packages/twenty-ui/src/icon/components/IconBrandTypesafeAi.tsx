import IconBrandTypesafeAiRaw from '@assets/icons/typesafe-ai.svg?react';
import { type IconComponentProps } from '@ui/icon/types/IconComponent';
import { useTheme } from '@ui/theme';

type IconBrandTypesafeAiProps = Pick<IconComponentProps, 'size' | 'color'>;

export const IconBrandTypesafeAi = (props: IconBrandTypesafeAiProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return (
    <IconBrandTypesafeAiRaw
      height={size}
      width={size}
      color={props.color ?? 'currentColor'}
    />
  );
};
