import { type Request, type Response } from 'express';
import { type EventOccurrence } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import {
  EVENT_STREAM_HEARTBEAT_INTERVAL_MS,
  EVENT_STREAM_REAUTHORIZATION_INTERVAL_MS,
} from 'src/engine/metadata-modules/event-metadata/constants/event-stream.constant';

export const streamEventOccurrences = async ({
  request,
  response,
  subscribe,
  closeAt,
  reauthorize,
  onClose,
}: {
  request: Request;
  response: Response;
  subscribe: (
    onOccurrence: (occurrence: EventOccurrence) => void,
  ) => Promise<() => void>;
  closeAt?: Date;
  reauthorize?: () => Promise<boolean>;
  onClose?: () => void;
}): Promise<void> => {
  let isClosed = false;
  let isStreaming = false;
  let unsubscribe: (() => void) | null = null;
  const timers: NodeJS.Timeout[] = [];
  const occurrencesReceivedBeforeStreaming: EventOccurrence[] = [];

  const writeOccurrence = (occurrence: EventOccurrence) =>
    response.write(
      `id: ${occurrence.id}\nevent: occurrence\ndata: ${JSON.stringify(occurrence)}\n\n`,
    );

  const close = () => {
    if (isClosed) {
      return;
    }

    isClosed = true;
    timers.forEach((timer) => clearInterval(timer));
    unsubscribe?.();
    onClose?.();

    if (!response.writableEnded) {
      response.end();
    }
  };

  request.on('close', close);

  unsubscribe = await subscribe((occurrence) => {
    if (isClosed) {
      return;
    }

    if (isStreaming) {
      writeOccurrence(occurrence);
    } else {
      occurrencesReceivedBeforeStreaming.push(occurrence);
    }
  });

  if (isClosed) {
    unsubscribe();

    return;
  }

  response.status(200);
  response.setHeader('Content-Type', 'text/event-stream');
  response.setHeader('Cache-Control', 'no-cache, no-transform');
  response.setHeader('Connection', 'keep-alive');
  response.setHeader('X-Accel-Buffering', 'no');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.flushHeaders();
  response.write('retry: 5000\n: connected\n\n');
  occurrencesReceivedBeforeStreaming.splice(0).forEach(writeOccurrence);
  isStreaming = true;

  timers.push(
    setInterval(() => {
      response.write(': heartbeat\n\n');
    }, EVENT_STREAM_HEARTBEAT_INTERVAL_MS),
  );

  if (isDefined(closeAt)) {
    timers.push(setTimeout(close, Math.max(closeAt.getTime() - Date.now(), 0)));
  }

  if (isDefined(reauthorize)) {
    timers.push(
      setInterval(() => {
        void reauthorize()
          .catch(() => false)
          .then((isStillAuthorized) => {
            if (!isStillAuthorized) {
              close();
            }
          });
      }, EVENT_STREAM_REAUTHORIZATION_INTERVAL_MS),
    );
  }
};
