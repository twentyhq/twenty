import { FrontComponentWorkerEffect } from '@/front-component/remote/components/FrontComponentWorkerEffect';
import { RemoteReceiver, RemoteRootRenderer } from '@remote-dom/react/host';
import React, { useMemo } from 'react';

type FrontComponentContentProps = {
  componentToRender: React.ReactNode;
  setHasError: (hasError: boolean) => void;
};

export const FrontComponentContent = ({
  componentToRender,
  setHasError,
}: FrontComponentContentProps) => {
  const receiver = useMemo(() => new RemoteReceiver(), []);

  return (
    <>
      <FrontComponentWorkerEffect
        workerUrl={new URL('./front-component.worker.ts', import.meta.url)}
        componentToRender={componentToRender}
        receiver={receiver}
        onError={() => setHasError(true)}
      />
      <RemoteRootRenderer receiver={receiver} components={new Map()} />
    </>
  );
};
