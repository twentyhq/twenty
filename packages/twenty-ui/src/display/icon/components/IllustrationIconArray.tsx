import IllustrationIconArrayRaw from '@assets/icons/illustration-array.svg?react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import {
  resolveThemeVariable,
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from '@ui/theme-constants';

type IllustrationIconArrayProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconArray = (props: IllustrationIconArrayProps) => {
  const size =
    props.size ?? resolveThemeVariableAsNumber(themeCssVariables.icon.size.lg);
  return (
    <IllustrationIconWrapper>
      <IllustrationIconArrayRaw
        fill={resolveThemeVariable(themeCssVariables.accent.accent3)}
        color={resolveThemeVariable(themeCssVariables.accent.accent8)}
        height={size}
        width={size}
      />
    </IllustrationIconWrapper>
  );
};
