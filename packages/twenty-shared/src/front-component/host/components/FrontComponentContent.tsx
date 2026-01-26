import { componentRegistry } from '../generated';
import { FrontComponentWorkerEffect } from '../../remote/components/FrontComponentWorkerEffect';
import { RemoteReceiver, RemoteRootRenderer } from '@remote-dom/react/host';
import React, { useMemo } from 'react';

type FrontComponentContentProps = {
  componentCode: string;
  setHasError: (hasError: boolean) => void;
};

export const FrontComponentContent = ({
  componentCode,
  setHasError,
}: FrontComponentContentProps) => {
  const receiver = useMemo(() => new RemoteReceiver(), []);

  return (
    <>
      <FrontComponentWorkerEffect
        workerUrl={new URL('../../remote/worker/worker.ts', import.meta.url)}
        componentCode={componentCode}
        receiver={receiver}
        onError={() => setHasError(true)}
      />
      <RemoteRootRenderer receiver={receiver} components={componentRegistry} />
    </>
  );
};
