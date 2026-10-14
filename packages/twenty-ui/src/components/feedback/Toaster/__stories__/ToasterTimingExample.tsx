import { useState } from 'react';

import { ToastProvider } from '@ui/components/feedback/Toast/ToastProvider';
import { useToast } from '@ui/components/feedback/Toast/hooks/useToast';
import { Button } from '@ui/primitives/input/Button/Button';

import { Toaster } from '../Toaster';
import { DEFAULT_TIMING_DURATION } from './DefaultTimingDuration';
import { type ToasterTimingExampleProps } from './ToasterTimingExampleProps';

const TimingActions = ({ id, duration }: { id: string; duration: number }) => {
  const { updateToast } = useToast();
  const [revision, setRevision] = useState(1);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <Button
        size="sm"
        onClick={() => {
          updateToast({ id, children: `Paused content update ${revision}` });
          setRevision(revision + 1);
        }}
      >
        Update paused content
      </Button>
      <Button size="sm" onClick={() => updateToast({ id, duration })}>
        Restart paused countdown
      </Button>
      <Button size="sm" onClick={() => updateToast({ id, progress: 25 })}>
        Enter paused progress
      </Button>
      <Button
        size="sm"
        onClick={() => updateToast({ id, progress: undefined })}
      >
        Leave paused progress
      </Button>
      <Button
        size="sm"
        onClick={() => updateToast({ id, action: null, onCancel: undefined })}
      >
        Remove focused actions
      </Button>
    </div>
  );
};

const TimingControls = ({
  duration = DEFAULT_TIMING_DURATION,
  onCancel,
  onClose,
}: ToasterTimingExampleProps) => {
  const { enqueueToast, updateToast, closeToast } = useToast();
  const [toastId, setToastId] = useState('');
  const [revision, setRevision] = useState(1);

  const addNotification = (isPersistent: boolean) => {
    const id = enqueueToast({
      children: 'Timed notification',
      duration: isPersistent ? 0 : duration,
      onCancel,
      onClose,
      cancelLabel: 'Keep working',
    });

    updateToast({ id, action: <TimingActions id={id} duration={duration} /> });
    setToastId(id);
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <Button onClick={() => addNotification(false)}>
        Add timed notification
      </Button>
      <Button onClick={() => addNotification(true)}>
        Add persistent notification
      </Button>
      <Button
        onClick={() => {
          updateToast({ id: toastId, children: `Content update ${revision}` });
          setRevision(revision + 1);
        }}
      >
        Update content
      </Button>
      <Button onClick={() => updateToast({ id: toastId, duration })}>
        Restart countdown
      </Button>
      <Button onClick={() => updateToast({ id: toastId, duration: 0 })}>
        Make persistent
      </Button>
      <Button onClick={() => updateToast({ id: toastId, progress: 25 })}>
        Enter progress
      </Button>
      <Button onClick={() => updateToast({ id: toastId, progress: 75 })}>
        Update progress
      </Button>
      <Button onClick={() => updateToast({ id: toastId, progress: undefined })}>
        Leave progress
      </Button>
      <Button onClick={() => closeToast(toastId)}>Close notification</Button>
      <Button>Outside toast</Button>
    </div>
  );
};

export const ToasterTimingExample = ({
  disableAnimations = false,
  ...props
}: ToasterTimingExampleProps) => {
  const [isMounted, setIsMounted] = useState(true);

  return (
    <>
      <Button onClick={() => setIsMounted(false)}>
        Unmount notification provider
      </Button>
      {isMounted && (
        <ToastProvider>
          <TimingControls {...props} />
          {disableAnimations && (
            <style>
              {`[data-toast-timing] * { animation: none !important; transition: none !important; }`}
            </style>
          )}
          <Toaster render={<section data-toast-timing />} />
        </ToastProvider>
      )}
    </>
  );
};
