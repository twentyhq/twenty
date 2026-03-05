import IconGmailRaw from '@assets/icons/gmail.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import {
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from '@ui/theme-constants';
type IconGmailProps = Pick<IconComponentProps, 'size'>;

export const IconGmail = (props: IconGmailProps) => {
  const size =
    props.size ?? resolveThemeVariableAsNumber(themeCssVariables.icon.size.lg);

  return <IconGmailRaw height={size} width={size} />;
};
