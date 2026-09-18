import { type IconComponent } from '@ui/icon/types/IconComponent';
import { type CalloutVariant } from './CalloutVariant';

export type CalloutProps = {
  variant: CalloutVariant;
  title: string;
  description: string;
  Icon?: IconComponent;
  action?: {
    label: string;
    onClick: () => void;
  };
  isClosable?: boolean;
  onClose?: () => void;
};
