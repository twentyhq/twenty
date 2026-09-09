import { useState } from 'react';

import { useToast } from '@ui/feedback/Toast/hooks/useToast';
import { ToastProvider } from '@ui/feedback/Toast/ToastProvider';
import { type ToastOptions } from '@ui/feedback/Toast/types/ToastOptions';

import { Toaster } from '../Toaster';

export type ToasterExampleProps = {
  limit?: number;
  onClose?: () => void;
};

export const ToastControls = ({ onClose }: ToasterExampleProps) => {
  const { add, close } = useToast();
  const [count, setCount] = useState(1);
  const [toastId, setToastId] = useState('');

  const addToast = (options: ToastOptions) => {
    setToastId(add({ progress: 100, onClose, ...options }));
  };

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <button
        type="button"
        onClick={() => {
          addToast({ children: `Notification ${count}` });
          setCount(count + 1);
        }}
      >
        Add notification
      </button>
      <button
        type="button"
        onClick={() =>
          addToast({ children: 'Already saved', dedupeKey: 'saved' })
        }
      >
        Add duplicate
      </button>
      <button
        type="button"
        onClick={() =>
          addToast({
            children: 'Timed notification',
            progress: undefined,
            duration: 800,
          })
        }
      >
        Add timed notification
      </button>
      <button type="button" onClick={() => close(toastId)}>
        Close last notification
      </button>
      <button type="button" onClick={() => close()}>
        Close all notifications
      </button>
      <span aria-label="Last notification ID">{toastId}</span>
    </div>
  );
};

export const ToasterExample = ({ limit, onClose }: ToasterExampleProps) => (
  <ToastProvider limit={limit}>
    <ToastControls onClose={onClose} />
    <Toaster />
  </ToastProvider>
);
