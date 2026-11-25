import IconBrandSalesforceRaw from '@assets/icons/salesforce.svg?react';
import { type IconComponentProps } from '@ui/icon/types/IconComponent';
import { useTheme } from '@ui/theme';

type IconBrandSalesforceProps = Pick<IconComponentProps, 'size'>;

export const IconBrandSalesforce = (props: IconBrandSalesforceProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return <IconBrandSalesforceRaw height={size} width={size} />;
};
