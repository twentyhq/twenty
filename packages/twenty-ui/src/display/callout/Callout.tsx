import { clsx } from 'clsx';
import { useState } from 'react';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { IconHelp, IconX } from '@ui/display/icon/components/TablerIcons';
import { type IconComponent } from '@ui/display/icon/types/IconComponent';
import { LightButton, LightIconButton } from '@ui/input';

import styles from './Callout.module.scss';

export type CalloutVariant =
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral'
  | 'success';

const CALLOUT_CONTAINER_VARIANT_CLASS_NAMES: Record<CalloutVariant, string> = {
  info: styles.containerInfo,
  warning: styles.containerWarning,
  error: styles.containerError,
  neutral: styles.containerNeutral,
  success: styles.containerSuccess,
};

const CALLOUT_ICON_VARIANT_CLASS_NAMES: Record<CalloutVariant, string> = {
  info: styles.iconContainerInfo,
  warning: styles.iconContainerWarning,
  error: styles.iconContainerError,
  neutral: styles.iconContainerNeutral,
  success: styles.iconContainerSuccess,
};

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

export const Callout = ({
  variant,
  title,
  description,
  Icon = IconHelp,
  action,
  isClosable = false,
  onClose,
}: CalloutProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    if (!isClosable) {
      return;
    }

    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={clsx(
        styles.container,
        CALLOUT_CONTAINER_VARIANT_CLASS_NAMES[variant],
      )}
    >
      <div className={styles.header}>
        <div
          className={clsx(
            styles.iconContainer,
            CALLOUT_ICON_VARIANT_CLASS_NAMES[variant],
          )}
        >
          <Icon size={16} />
        </div>
        <div className={styles.title}>{title}</div>
        {isClosable && (
          <LightIconButton
            Icon={IconX}
            size="small"
            aria-label="Close"
            onClick={handleClose}
          />
        )}
      </div>
      <div
        className={clsx(
          styles.descriptionWrapper,
          isDefined(action) && styles.descriptionWrapperWithAction,
        )}
      >
        <div className={styles.description}>{description}</div>
      </div>
      {isDefined(action) && (
        <div className={styles.footer}>
          <LightButton
            type="button"
            title={action.label}
            onClick={action.onClick}
          />
        </div>
      )}
    </div>
  );
};
