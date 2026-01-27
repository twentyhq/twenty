import { ThreadWebWorker } from '@quilted/threads';
import { type RemoteReceiver } from '@remote-dom/core/receivers';
import { useEffect } from 'react';
import { type SandboxAPI } from '../../types/SandboxApi';

type FrontComponentWorkerEffectProps = {
  isInitialized: boolean;
  workerUrl: URL;
  componentUrl: string;
  receiver: RemoteReceiver;
  onError: (error?: Error) => void;
};

export const FrontComponentWorkerEffect = ({
  isInitialized,
  workerUrl,
  componentUrl,
  receiver,
  onError,
}: FrontComponentWorkerEffectProps) => {
  useEffect(() => {
    let worker: Worker | null = null;

    const runWorker = async () => {
      if (isInitialized) {
        return;
      }

      try {
        worker = new Worker(workerUrl, {
          type: 'module',
        });

        const workerSandbox = new ThreadWebWorker<SandboxAPI>(worker);

        await workerSandbox.imports.render(receiver.connection, {
          componentUrl,
        });
      } catch (error) {
        onError(error);
      }
    };

    runWorker();

    return () => {
      worker?.terminate();
    };
  }, [componentUrl, receiver, onError]);

  return null;
};
