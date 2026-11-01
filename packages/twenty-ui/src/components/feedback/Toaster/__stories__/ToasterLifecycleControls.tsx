import { useState } from 'react';

import { useToast } from '@ui/components/feedback/Toast/hooks/useToast';
import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';

import { type ToasterLifecycleExampleProps } from './ToasterLifecycleExampleProps';
import { ToasterLifecycleUnrelatedNotificationActions } from './ToasterLifecycleUnrelatedNotificationActions';

const DEFAULT_LIFECYCLE_DURATION = 1800;

type ToasterLifecycleControlsProps = Pick<
  ToasterLifecycleExampleProps,
  'duration' | 'hasUnrelatedNotificationActions' | 'onClose'
> & {
  onDetachRenderers: () => void;
  onRememberProviderOperations?: (operations: () => void) => void;
};

export const ToasterLifecycleControls = ({
  duration = DEFAULT_LIFECYCLE_DURATION,
  hasUnrelatedNotificationActions = false,
  onClose,
  onDetachRenderers,
  onRememberProviderOperations,
}: ToasterLifecycleControlsProps) => {
  const { enqueueToast, updateToast, closeToast } = useToast();
  const [notificationNumber, setNotificationNumber] = useState(1);
  const [toastId, setToastId] = useState('');

  const addNotification = (notificationDuration: number) => {
    const notification = `Lifecycle notification ${notificationNumber}`;
    const id = enqueueToast({
      children: notification,
      duration: notificationDuration,
      onClose: () => onClose?.(notification),
      action: hasUnrelatedNotificationActions ? (
        <ToasterLifecycleUnrelatedNotificationActions onClose={onClose} />
      ) : (
        <Button size="sm">Notification action</Button>
      ),
    });

    onRememberProviderOperations?.(() => {
      closeToast(id);
      updateToast({ id, children: 'Previous provider notification updated' });
      enqueueToast({
        children: 'Previous provider notification enqueued',
        duration: 0,
        onClose: () => onClose?.('Previous provider notification'),
      });
    });
    setToastId(id);
    setNotificationNumber(notificationNumber + 1);
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <Button onClick={() => addNotification(0)}>
        Add persistent notification
      </Button>
      <Button onClick={() => addNotification(duration)}>
        Add timed notification
      </Button>
      <Button
        onClick={() =>
          updateToast({
            id: toastId,
            children: 'Updated lifecycle notification',
          })
        }
      >
        Update last notification
      </Button>
      <Button onClick={() => updateToast({ id: toastId, duration })}>
        Restart last countdown
      </Button>
      <Button onClick={() => closeToast(toastId)}>
        Close last notification
      </Button>
      <Button onClick={() => closeToast()}>Close all notifications</Button>
      <Button
        onClick={() => {
          closeToast(toastId);
          updateToast({
            id: toastId,
            children: 'Dismissed notification updated',
          });
          closeToast(toastId);
          updateToast({ id: toastId, duration });
        }}
      >
        Dismiss and update notification
      </Button>
      <Button
        onClick={() => {
          closeToast(toastId);
          onDetachRenderers();
        }}
      >
        Dismiss and detach renderers
      </Button>
      <Button>Outside notifications</Button>
      <Text role="note" aria-label="Last lifecycle notification ID">
        {toastId}
      </Text>
    </div>
  );
};
