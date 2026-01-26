import { RemoteReceiver, RemoteRootRenderer } from '@remote-dom/react/host';
import React, { useMemo } from 'react';
import { FrontComponentWorkerEffect } from '../../remote/components/FrontComponentWorkerEffect';
import { componentRegistry } from '../generated';

type FrontComponentContentProps = {
  componentUrl: string;
  setHasError: (hasError: boolean) => void;
};

export const FrontComponentContent = ({
  componentUrl,
  setHasError,
}: FrontComponentContentProps) => {
  const receiver = useMemo(() => new RemoteReceiver(), []);

  return (
    <>
      <FrontComponentWorkerEffect
        workerUrl={new URL('../../remote/worker/worker.ts', import.meta.url)}
        componentUrl={componentUrl}
        receiver={receiver}
        onError={() => setHasError(true)}
      />
      <RemoteRootRenderer receiver={receiver} components={componentRegistry} />
    </>
  );
};
