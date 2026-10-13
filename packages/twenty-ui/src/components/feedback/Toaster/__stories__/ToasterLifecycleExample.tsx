import { useState } from 'react';

import { ToastProvider } from '@ui/components/feedback/Toast/ToastProvider';
import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';

import { Toaster } from '../Toaster';
import { ToastControls } from './ToastControls';
import { ToasterLifecycleControls } from './ToasterLifecycleControls';
import { type ToasterLifecycleExampleProps } from './ToasterLifecycleExampleProps';

export const ToasterLifecycleExample = ({
  duration,
  hasIndependentProvider = false,
  hasSlowMirrorExit = false,
  hasUnrelatedNotificationActions = false,
  onClose,
}: ToasterLifecycleExampleProps) => {
  const [limit, setLimit] = useState(3);
  const [isProviderMounted, setIsProviderMounted] = useState(true);
  const [isFirstRendererMounted, setIsFirstRendererMounted] = useState(true);
  const [isSecondRendererMounted, setIsSecondRendererMounted] = useState(true);
  const [previousProviderOperations, setPreviousProviderOperations] = useState<
    (() => void) | undefined
  >();

  const detachRenderers = () => {
    setIsFirstRendererMounted(false);
    setIsSecondRendererMounted(false);
  };

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Button onClick={() => setLimit(1)}>Limit to one notification</Button>
        <Button onClick={() => setLimit(4)}>Limit to four notifications</Button>
        <Button
          onClick={() => setIsFirstRendererMounted(!isFirstRendererMounted)}
        >
          {isFirstRendererMounted
            ? 'Detach first renderer'
            : 'Mount first renderer'}
        </Button>
        <Button
          onClick={() => setIsSecondRendererMounted(!isSecondRendererMounted)}
        >
          {isSecondRendererMounted
            ? 'Detach second renderer'
            : 'Mount second renderer'}
        </Button>
        <Button onClick={detachRenderers}>Detach all renderers</Button>
        <Button
          onClick={() => {
            setIsFirstRendererMounted(true);
            setIsSecondRendererMounted(true);
          }}
        >
          Mount both renderers
        </Button>
        <Button onClick={() => setIsProviderMounted(!isProviderMounted)}>
          {isProviderMounted
            ? 'Unmount notification provider'
            : 'Mount notification provider'}
        </Button>
        <Button onClick={() => previousProviderOperations?.()}>
          Run previous provider operations
        </Button>
        <Text role="note" aria-label="Notification limit">
          {limit}
        </Text>
      </div>
      <section aria-label="Lifecycle source">
        {isProviderMounted && (
          <ToastProvider limit={limit}>
            <ToasterLifecycleControls
              duration={duration}
              hasUnrelatedNotificationActions={hasUnrelatedNotificationActions}
              onClose={onClose}
              onDetachRenderers={detachRenderers}
              onRememberProviderOperations={(operations) =>
                setPreviousProviderOperations(
                  (previousOperations) => previousOperations ?? operations,
                )
              }
            />
            {isFirstRendererMounted && (
              <Toaster
                aria-label="First lifecycle notifications"
                style={{ bottom: 180 }}
              />
            )}
            {isSecondRendererMounted && (
              <Toaster
                aria-label="Second lifecycle notifications"
                data-lifecycle-second
              />
            )}
          </ToastProvider>
        )}
      </section>
      {hasSlowMirrorExit && (
        <style>
          {`[data-lifecycle-second] [data-exiting] { transition-duration: 1200ms !important; }`}
        </style>
      )}
      {hasIndependentProvider && (
        <section aria-label="Independent source">
          <ToastProvider>
            <ToastControls
              onClose={() => onClose?.('Independent notification')}
            />
            <Toaster
              aria-label="Independent notifications"
              style={{ right: 360 }}
            />
          </ToastProvider>
        </section>
      )}
    </>
  );
};
