import { isRecordGqlOperationSignature } from 'twenty-shared/utils';

import { type EventStreamData } from 'src/engine/subscriptions/types/event-stream-data.type';

export const isStreamQueryingObject = ({
  streamData,
  objectNameSingular,
}: {
  streamData: Pick<EventStreamData, 'queries'>;
  objectNameSingular: string;
}): boolean =>
  Object.values(streamData.queries).some(
    (operationSignature) =>
      isRecordGqlOperationSignature(operationSignature) &&
      operationSignature.objectNameSingular === objectNameSingular,
  );
