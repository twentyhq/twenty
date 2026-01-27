import { RemoteReceiver, RemoteRootRenderer } from '@remote-dom/react/host';
import React, { useMemo } from 'react';
import { FRONT_COMPONENT_WORKER_URL } from '../../constants/FrontComponentWorkerUrl';
import { FrontComponentWorkerEffect } from '../../remote/components/FrontComponentWorkerEffect';
import { componentRegistry } from '../generated';

type FrontComponentContentProps = {
  isInitialized: boolean;
  componentUrl: string;
  onError: (error?: Error) => void;
};

export const FrontComponentContent = ({
  isInitialized,
  componentUrl,
  onError,
}: FrontComponentContentProps) => {
  const receiver = useMemo(() => new RemoteReceiver(), []);

  return (
    <>
      <FrontComponentWorkerEffect
        isInitialized={isInitialized}
        workerUrl={FRONT_COMPONENT_WORKER_URL}
        componentUrl={componentUrl}
        receiver={receiver}
        onError={onError}
      />
      <RemoteRootRenderer receiver={receiver} components={componentRegistry} />
    </>
  );
};
