import { Suspense, useState } from 'react';

import { ToastProvider } from '@ui/components/feedback/Toast/ToastProvider';
import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';

import { Toaster } from '../Toaster';
import { ToasterLifecycleControls } from './ToasterLifecycleControls';
import { type ToasterLifecycleExampleProps } from './ToasterLifecycleExampleProps';
import { ToasterProviderSuspension } from './ToasterProviderSuspension';

type ToasterProviderSuspenseExampleProps = Pick<
  ToasterLifecycleExampleProps,
  'duration' | 'onClose'
>;

export const ToasterProviderSuspenseExample = ({
  duration,
  onClose,
}: ToasterProviderSuspenseExampleProps) => {
  const [isProviderMounted, setIsProviderMounted] = useState(true);
  const [pendingSuspension, setPendingSuspension] = useState<Promise<void>>();
  const [revealProvider, setRevealProvider] = useState<() => void>();

  const suspendProvider = () => {
    setPendingSuspension(
      new Promise<void>((resolve) => setRevealProvider(() => resolve)),
    );
  };

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Button onClick={suspendProvider}>Suspend notification provider</Button>
        <Button
          onClick={() => {
            revealProvider?.();
            setPendingSuspension(undefined);
          }}
        >
          Reveal notification provider
        </Button>
        <Button onClick={() => setIsProviderMounted(false)}>
          Unmount notification provider
        </Button>
      </div>
      {isProviderMounted && (
        <Suspense
          fallback={
            <Text role="note" aria-label="Provider suspension state">
              Notification provider suspended
            </Text>
          }
        >
          <ToastProvider>
            <ToasterLifecycleControls
              duration={duration}
              onClose={onClose}
              onDetachRenderers={() => setIsProviderMounted(false)}
            />
            <Toaster aria-label="Suspense lifecycle notifications" />
            <ToasterProviderSuspension pendingSuspension={pendingSuspension} />
          </ToastProvider>
        </Suspense>
      )}
    </>
  );
};
