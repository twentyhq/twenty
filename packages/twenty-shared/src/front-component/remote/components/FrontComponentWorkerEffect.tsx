import { type SandboxAPI } from '@/front-component/remote/types/SandboxApi';
import { ThreadWebWorker } from '@quilted/threads';
import { type RemoteReceiver } from '@remote-dom/core/receivers';
import { useEffect } from 'react';

type FrontComponentWorkerEffectProps = {
  workerUrl: URL;
  componentToRender: React.ReactNode;
  receiver: RemoteReceiver;
  onError: () => void;
};

export const FrontComponentWorkerEffect = ({
  workerUrl,
  componentToRender,
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
          componentToRender,
        });
      } catch {
        onError();
      }
    };

    runWorker();

    return () => {
      worker?.terminate();
    };
  }, [componentToRender, receiver, onError]);

  return null;
};
