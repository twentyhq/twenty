import IconWhatsappRaw from '@assets/icons/whatsapp.svg?react';
import { type IconComponentProps } from '@ui/icon/types/IconComponent';
import { useTheme } from '@ui/theme';

type IconWhatsappProps = Pick<IconComponentProps, 'size'>;

export const IconWhatsapp = (props: IconWhatsappProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return <IconWhatsappRaw height={size} width={size} />;
};
