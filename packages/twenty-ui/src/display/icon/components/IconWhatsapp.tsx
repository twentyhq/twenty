import IconWhatsappRaw from '@assets/icons/whatsapp.svg?react';
import { useTheme } from '@emotion/react';
import type { IconComponentProps } from '@ui/display';

type IconWhatsappProps = Pick<IconComponentProps, 'size'>;

export const IconWhatsapp = (props: IconWhatsappProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return <IconWhatsappRaw height={size} width={size} />;
};
