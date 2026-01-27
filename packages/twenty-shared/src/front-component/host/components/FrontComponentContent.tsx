import {
  type RemoteReceiver,
  RemoteRootRenderer,
} from '@remote-dom/react/host';
import React, { useState } from 'react';
import { isDefined } from '../../../utils/validation/isDefined';
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
  const [receiver, setReceiver] = useState<RemoteReceiver | null>(null);

  return (
    <>
      <FrontComponentWorkerEffect
        workerUrl={FRONT_COMPONENT_WORKER_URL}
        componentUrl={componentUrl}
        setReceiver={setReceiver}
        onError={onError}
      />

      {isDefined(receiver) && (
        <RemoteRootRenderer
          receiver={receiver}
          components={componentRegistry}
        />
      )}
    </>
  );
};
