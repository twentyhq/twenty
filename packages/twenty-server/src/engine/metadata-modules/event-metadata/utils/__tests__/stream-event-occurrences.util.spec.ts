import { type Server } from 'http';
import { connect, type Socket } from 'net';

import { isString } from '@sniptt/guards';
import express from 'express';
import { type EventOccurrence } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { streamEventOccurrences } from 'src/engine/metadata-modules/event-metadata/utils/stream-event-occurrences.util';

const buildOccurrence = (textLength: number): EventOccurrence => ({
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  type: 'messageAdded',
  occurredAt: '2026-10-27T10:00:00.000Z',
  properties: { text: 'x'.repeat(textLength) },
});

const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

describe('streamEventOccurrences', () => {
  let server: Server;
  let client: Socket;
  let pushOccurrence: ((occurrence: EventOccurrence) => void) | null;
  let isUnsubscribed: boolean;

  beforeEach(async () => {
    // The stream is driven by real sockets, which the global fake timers would stall
    jest.useRealTimers();
    pushOccurrence = null;
    isUnsubscribed = false;

    server = express()
      .get('/stream', (request, response) => {
        void streamEventOccurrences({
          request,
          response,
          subscribe: async (onOccurrence) => {
            pushOccurrence = onOccurrence;

            return () => {
              isUnsubscribed = true;
            };
          },
        });
      })
      .listen(0);

    const address = server.address();

    if (!isDefined(address) || isString(address)) {
      throw new Error('Test server did not bind to a port');
    }

    client = connect(address.port, '127.0.0.1');
    client.write('GET /stream HTTP/1.1\r\nHost: localhost\r\n\r\n');

    while (!isDefined(pushOccurrence)) {
      await wait(5);
    }
  });

  afterEach(async () => {
    client.destroy();
    await new Promise((resolve) => server.close(resolve));
  });

  it('should close a client that stops reading instead of buffering its occurrences', async () => {
    client.pause();

    for (
      let pushedCount = 0;
      pushedCount < 64 && !isUnsubscribed;
      pushedCount++
    ) {
      pushOccurrence?.(buildOccurrence(1_000_000));
      await wait(5);
    }

    expect(isUnsubscribed).toBe(true);
  });

  it('should keep streaming to a client that reads', async () => {
    client.resume();

    for (let pushedCount = 0; pushedCount < 64; pushedCount++) {
      pushOccurrence?.(buildOccurrence(32_000));
      await wait(1);
    }

    expect(isUnsubscribed).toBe(false);
  });
});
