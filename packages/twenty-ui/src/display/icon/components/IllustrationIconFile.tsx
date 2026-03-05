import IllustrationIconFileRaw from '@assets/icons/illustration-file.svg?react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import {
  resolveThemeVariable,
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from '@ui/theme-constants';

type IllustrationIconFileProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconFile = (props: IllustrationIconFileProps) => {
  const size =
    props.size ?? resolveThemeVariableAsNumber(themeCssVariables.icon.size.lg);
  return (
    <IllustrationIconWrapper>
      <IllustrationIconFileRaw
        height={size}
        width={size}
        fill={resolveThemeVariable(themeCssVariables.accent.accent3)}
        color={resolveThemeVariable(themeCssVariables.accent.accent8)}
      />
    </IllustrationIconWrapper>
  );
};
