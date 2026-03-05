import IllustrationIconLinkRaw from '@assets/icons/illustration-link.svg?react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import {
  resolveThemeVariable,
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from '@ui/theme-constants';

type IllustrationIconLinkProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconLink = (props: IllustrationIconLinkProps) => {
  const size =
    props.size ?? resolveThemeVariableAsNumber(themeCssVariables.icon.size.lg);
  return (
    <IllustrationIconWrapper>
      <IllustrationIconLinkRaw
        height={size}
        width={size}
        fill={resolveThemeVariable(themeCssVariables.accent.accent3)}
        color={resolveThemeVariable(themeCssVariables.accent.accent8)}
      />
    </IllustrationIconWrapper>
  );
};
