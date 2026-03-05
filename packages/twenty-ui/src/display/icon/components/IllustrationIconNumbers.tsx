import IllustrationIconNumbersRaw from '@assets/icons/illustration-numbers.svg?react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import {
  resolveThemeVariable,
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from '@ui/theme-constants';

type IllustrationIconNumbersProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconNumbers = (
  props: IllustrationIconNumbersProps,
) => {
  const size =
    props.size ?? resolveThemeVariableAsNumber(themeCssVariables.icon.size.lg);
  return (
    <IllustrationIconWrapper>
      <IllustrationIconNumbersRaw
        height={size}
        width={size}
        fill={resolveThemeVariable(themeCssVariables.accent.accent3)}
        color={resolveThemeVariable(themeCssVariables.accent.accent8)}
      />
    </IllustrationIconWrapper>
  );
};
