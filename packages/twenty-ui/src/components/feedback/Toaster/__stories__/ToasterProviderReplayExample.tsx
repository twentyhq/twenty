import { type ReactNode, StrictMode, useState } from 'react';

import { ToastProvider } from '@ui/components/feedback/Toast/ToastProvider';
import { Button } from '@ui/primitives/input/Button/Button';

import { Toaster } from '../Toaster';

type ToasterProviderReplayExampleProps = {
  children: ReactNode;
};

export const ToasterProviderReplayExample = ({
  children,
}: ToasterProviderReplayExampleProps) => {
  const [isProviderMounted, setIsProviderMounted] = useState(true);

  return (
    <>
      <Button onClick={() => setIsProviderMounted(false)}>
        Unmount notification provider
      </Button>
      {isProviderMounted && (
        <StrictMode>
          <ToastProvider>
            {children}
            <Toaster aria-label="Effect lifecycle notifications" />
          </ToastProvider>
        </StrictMode>
      )}
    </>
  );
};
