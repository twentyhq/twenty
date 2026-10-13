import { useState } from 'react';

import { ToastProvider } from '@ui/components/feedback/Toast/ToastProvider';
import { Button } from '@ui/primitives/input/Button/Button';
import { DirectionProvider } from '@ui/primitives/layout/DirectionProvider/DirectionProvider';
import { ThemeProvider } from '@ui/theme/ThemeProvider';

import { Toaster } from '../Toaster';
import { ToastControls } from './ToastControls';

type ToasterPortalExampleProps = {
  isScoped?: boolean;
};

export const ToasterPortalExample = ({
  isScoped = false,
}: ToasterPortalExampleProps) => {
  const [destination, setDestination] = useState<HTMLElement | null>(null);
  const [target, setTarget] = useState<'default' | 'explicit' | 'null'>(
    'default',
  );
  const portalContainers = {
    default: undefined,
    explicit: destination,
    null: null,
  };
  const container = portalContainers[target];

  const example = (
    <div
      style={{
        backgroundColor: 'var(--t-background-primary)',
        color: 'var(--t-font-color-primary)',
      }}
    >
      <ToastProvider>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Button onClick={() => setTarget('default')}>
            Use default portal
          </Button>
          <Button onClick={() => setTarget('explicit')}>
            Use explicit portal
          </Button>
          <Button onClick={() => setTarget('null')}>Disable portal</Button>
        </div>
        <ToastControls />
        <section
          aria-label="Explicit portal destination"
          ref={setDestination}
        />
        <Toaster aria-label="Portal notifications" container={container} />
      </ToastProvider>
    </div>
  );

  return isScoped ? (
    <ThemeProvider
      colorScheme="dark"
      applyToRoot={false}
      className="toast-lifecycle-portal-scope"
    >
      <DirectionProvider direction="rtl">{example}</DirectionProvider>
    </ThemeProvider>
  ) : (
    example
  );
};
