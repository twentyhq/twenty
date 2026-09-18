import { isDefined } from '@ui/utilities/utils/isDefined';
import { clsx } from 'clsx';
import { useState } from 'react';
import { type CalloutProps } from './types/CalloutProps';
import { type CalloutVariant } from './types/CalloutVariant';

import { IconHelp, IconX } from '@ui/icon/components/TablerIcons';
import { Button } from '@ui/primitives/input/Button/Button';

import styles from './Callout.module.scss';

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
          <Button
            startIcon={<IconX />}
            className={styles.closeButton}
            variant="ghost"
            size="sm"
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
          <Button
            type="button"
            onClick={action.onClick}
            size="sm"
            variant="ghost"
            style={{ fontWeight: 'var(--t-font-weight-regular)' }}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
};
