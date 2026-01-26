import { type SandboxAPI } from '../../types/SandboxApi';
import { ThreadWebWorker } from '@quilted/threads';
import { type RemoteReceiver } from '@remote-dom/core/receivers';
import { useEffect } from 'react';

type FrontComponentWorkerEffectProps = {
  workerUrl: URL;
  componentCode: string;
  receiver: RemoteReceiver;
  onError: () => void;
};

export const FrontComponentWorkerEffect = ({
  workerUrl,
  componentCode,
  receiver,
  onError,
}: FrontComponentWorkerEffectProps) => {
  useEffect(() => {
    let worker: Worker | null = null;

    const runWorker = async () => {
      try {
        worker = new Worker(workerUrl, {
          type: 'module',
        });

        const workerSandbox = new ThreadWebWorker<SandboxAPI>(worker);

        await workerSandbox.imports.render(receiver.connection, {
          componentCode,
        });
      } catch {
        onError();
      }
    };

    runWorker();

    return () => {
      worker?.terminate();
    };
  }, [componentCode, receiver, onError]);

  return null;
};
