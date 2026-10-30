import { useState } from 'react';

import { ToastProvider } from '@ui/components/feedback/Toast/ToastProvider';
import { useToast } from '@ui/components/feedback/Toast/hooks/useToast';
import { type ToastProps } from '@ui/components/feedback/Toast/types/ToastProps';
import { Button } from '@ui/primitives/input/Button/Button';

import { Toaster } from '../Toaster';

const DEFAULT_TIMING_OVERRIDE_DURATION = 1800;

type ToasterLifecycleTimingOverrideExampleProps = {
  duration?: number;
  progress?: number;
  initialTimingOverrides: Pick<Partial<ToastProps>, 'duration' | 'progress'>;
  onClose?: (notification: string) => void;
};

type TimingOverrideControlsProps = Pick<
  ToasterLifecycleTimingOverrideExampleProps,
  'progress' | 'onClose'
> & {
  duration: number;
  onUseDefaultDuration: () => void;
  onClearProgress: () => void;
};

const TimingOverrideControls = ({
  duration,
  progress,
  onClose,
  onUseDefaultDuration,
  onClearProgress,
}: TimingOverrideControlsProps) => {
  const { enqueueToast } = useToast();
  const [notificationNumber, setNotificationNumber] = useState(1);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <Button
        onClick={() => {
          const notification = `Override notification ${notificationNumber}`;
          enqueueToast({
            children: notification,
            duration,
            progress,
            onClose: () => onClose?.(notification),
          });
          setNotificationNumber(notificationNumber + 1);
        }}
      >
        Add override notification
      </Button>
      <Button onClick={onUseDefaultDuration}>
        Use default duration override
      </Button>
      <Button onClick={onClearProgress}>Clear progress override</Button>
    </div>
  );
};

export const ToasterLifecycleTimingOverrideExample = ({
  duration = DEFAULT_TIMING_OVERRIDE_DURATION,
  progress,
  initialTimingOverrides,
  onClose,
}: ToasterLifecycleTimingOverrideExampleProps) => {
  const [timingOverrides, setTimingOverrides] = useState(
    initialTimingOverrides,
  );

  return (
    <ToastProvider>
      <TimingOverrideControls
        duration={duration}
        progress={progress}
        onClose={onClose}
        onUseDefaultDuration={() =>
          setTimingOverrides((currentOverrides) => ({
            ...currentOverrides,
            duration: undefined,
          }))
        }
        onClearProgress={() =>
          setTimingOverrides((currentOverrides) => ({
            ...currentOverrides,
            progress: undefined,
          }))
        }
      />
      <Toaster
        aria-label="First lifecycle notifications"
        style={{ bottom: 180 }}
        getToastProps={() => timingOverrides}
      />
      <Toaster
        aria-label="Second lifecycle notifications"
        getToastProps={() => timingOverrides}
      />
    </ToastProvider>
  );
};
