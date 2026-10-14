import { useState } from 'react';

import { useToast } from '@ui/components/feedback/Toast/hooks/useToast';
import { Button } from '@ui/primitives/input/Button/Button';

type ToasterLifecycleUnrelatedNotificationActionsProps = {
  onClose?: (notification: string) => void;
};

export const ToasterLifecycleUnrelatedNotificationActions = ({
  onClose,
}: ToasterLifecycleUnrelatedNotificationActionsProps) => {
  const { enqueueToast, updateToast } = useToast();
  const [toastId, setToastId] = useState('');

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <Button size="sm">Notification action</Button>
      <Button
        size="sm"
        onClick={() =>
          setToastId(
            enqueueToast({
              children: 'Unrelated notification',
              duration: 0,
              onClose: () => onClose?.('Unrelated notification'),
            }),
          )
        }
      >
        Add unrelated notification
      </Button>
      <Button
        size="sm"
        onClick={() =>
          updateToast({
            id: toastId,
            children: 'Updated unrelated notification',
          })
        }
      >
        Update unrelated notification
      </Button>
    </div>
  );
};
