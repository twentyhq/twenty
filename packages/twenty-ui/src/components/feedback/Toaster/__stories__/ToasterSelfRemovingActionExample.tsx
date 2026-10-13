import { useState } from 'react';

import { ToastProvider } from '@ui/components/feedback/Toast/ToastProvider';
import { useToast } from '@ui/components/feedback/Toast/hooks/useToast';
import { Button } from '@ui/primitives/input/Button/Button';

import { Toaster } from '../Toaster';
import { type ToasterTimingExampleProps } from './ToasterTimingExampleProps';

const DEFAULT_TIMING_DURATION = 1400;

const SelfRemovingAction = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <Button onClick={() => setIsVisible(false)}>
      Remove this focused action
    </Button>
  );
};

const SelfRemovingActionControls = ({
  duration = DEFAULT_TIMING_DURATION,
  onClose,
}: ToasterTimingExampleProps) => {
  const { enqueueToast } = useToast();

  return (
    <Button
      onClick={() =>
        enqueueToast({
          children: 'Timed notification',
          duration,
          action: <SelfRemovingAction />,
          onClose,
        })
      }
    >
      Add timed notification
    </Button>
  );
};

export const ToasterSelfRemovingActionExample = (
  props: ToasterTimingExampleProps,
) => (
  <ToastProvider>
    <SelfRemovingActionControls
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
    <Toaster />
  </ToastProvider>
);
