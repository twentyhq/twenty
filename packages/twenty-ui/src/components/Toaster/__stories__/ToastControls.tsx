import { useState } from 'react';

import { useToast } from '@ui/components/Toast/hooks/useToast';
import { type ToastOptions } from '@ui/components/Toast/types/ToastOptions';

type ToastControlsProps = {
  onClose?: () => void;
};

export const ToastControls = ({ onClose }: ToastControlsProps) => {
  const { enqueueToast, closeToast } = useToast();
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
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <button
        type="button"
        onClick={() => {
          enqueueExampleToast({ children: `Notification ${count}` });
          setCount(count + 1);
        }}
      >
        Add notification
      </button>
      <button
        type="button"
        onClick={() =>
          enqueueExampleToast({ children: 'Already saved', dedupeKey: 'saved' })
        }
      >
        Add duplicate
      </button>
      <button
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
      </button>
      <button type="button" onClick={() => closeToast(toastId)}>
        Close last notification
      </button>
      <button type="button" onClick={() => closeToast()}>
        Close all notifications
      </button>
      <span aria-label="Last notification ID">{toastId}</span>
    </div>
  );
};
