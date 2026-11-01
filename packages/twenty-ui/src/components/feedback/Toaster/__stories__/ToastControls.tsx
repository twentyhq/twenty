import { useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';

import { useToast } from '@ui/components/feedback/Toast/hooks/useToast';
import { type ToastOptions } from '@ui/components/feedback/Toast/types/ToastOptions';

type ToastControlsProps = {
  onClose?: () => void;
};

export const ToastControls = ({ onClose }: ToastControlsProps) => {
  const { enqueueToast, closeToast, updateToast } = useToast();
  const [count, setCount] = useState(1);
  const [toastId, setToastId] = useState('');

  const enqueueExampleToast = (options: ToastOptions) => {
    const id = enqueueToast({
      progress: 100,
      ...options,
      onClose: options.onClose ?? onClose,
    });
    setToastId(id);
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        backgroundColor: 'var(--t-background-primary)',
        color: 'var(--t-font-color-primary)',
      }}
    >
      <Button
        type="button"
        onClick={() => {
          enqueueExampleToast({ children: `Notification ${count}` });
          setCount(count + 1);
        }}
      >
        Add notification
      </Button>
      <Button
        type="button"
        onClick={() =>
          enqueueExampleToast({ children: 'Already saved', dedupeKey: 'saved' })
        }
      >
        Add duplicate
      </Button>
      <Button
        type="button"
        onClick={() =>
          enqueueExampleToast({
            children: 'Timed notification',
            progress: undefined,
            duration: 800,
          })
        }
      >
        Add timed notification
      </Button>
      <Button type="button" onClick={() => closeToast(toastId)}>
        Close last notification
      </Button>
      <Button type="button" onClick={() => closeToast()}>
        Close all notifications
      </Button>
      <Button
        type="button"
        onClick={() =>
          updateToast({ id: toastId, children: 'Updated notification' })
        }
      >
        Update last notification
      </Button>
      <Text role="note" aria-label="Last notification ID">
        {toastId}
      </Text>
    </div>
  );
};
