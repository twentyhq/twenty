import { v5 } from 'uuid';

const EVENT_STREAM_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

export const eventStreamIdToChannelId = (eventStreamId: string): string => {
  return v5(eventStreamId, EVENT_STREAM_NAMESPACE);
};
