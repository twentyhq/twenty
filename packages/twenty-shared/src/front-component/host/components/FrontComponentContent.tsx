import { RemoteReceiver, RemoteRootRenderer } from '@remote-dom/react/host';
import React, { useMemo } from 'react';
import { FRONT_COMPONENT_WORKER_URL } from '../../constants/FrontComponentWorkerUrl';
import { FrontComponentWorkerEffect } from '../../remote/components/FrontComponentWorkerEffect';
import { componentRegistry } from '../generated';

type FrontComponentContentProps = {
  componentUrl: string;
  onError: (error?: Error) => void;
};

export const FrontComponentContent = ({
  componentUrl,
  onError,
}: FrontComponentContentProps) => {
  const receiver = useMemo(() => new RemoteReceiver(), []);

  return (
    <>
      <FrontComponentWorkerEffect
        workerUrl={FRONT_COMPONENT_WORKER_URL}
        componentUrl={componentUrl}
        receiver={receiver}
        onError={onError}
      />
      <RemoteRootRenderer receiver={receiver} components={componentRegistry} />
    </>
  );
};
