import { ToastProvider } from '@ui/components/feedback/Toast/ToastProvider';
import { useToast } from '@ui/components/feedback/Toast/hooks/useToast';
import { Button } from '@ui/primitives/input/Button/Button';

import { Toaster } from '../Toaster';
import { type ToasterTimingExampleProps } from './ToasterTimingExampleProps';

const DEFAULT_TIMING_DURATION = 1400;

const RootReplacementControls = ({
  duration = DEFAULT_TIMING_DURATION,
  onClose,
}: ToasterTimingExampleProps) => {
  const { enqueueToast, updateToast } = useToast();

  return (
    <Button
      onClick={() => {
        const id = enqueueToast({
          children: 'Timed notification',
          duration,
          onClose,
        });

        updateToast({
          id,
          action: (
            <Button onClick={() => updateToast({ id, render: <section /> })}>
              Replace focused toast root
            </Button>
          ),
        });
      }}
    >
      Add timed notification
    </Button>
  );
};

export const ToasterRootReplacementExample = (
  props: ToasterTimingExampleProps,
) => (
  <ToastProvider>
    <RootReplacementControls {...props} />
    <Toaster />
  </ToastProvider>
);
