import { MessageDeliveryStatus } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const MESSAGE_DELIVERY_STATUS_RANK: Record<MessageDeliveryStatus, number> = {
  [MessageDeliveryStatus.SENT]: 0,
  [MessageDeliveryStatus.DELIVERED]: 1,
  [MessageDeliveryStatus.READ]: 2,
};

export const isMessageDeliveryStatusAhead = ({
  nextStatus,
  currentStatus,
}: {
  nextStatus: MessageDeliveryStatus;
  currentStatus: MessageDeliveryStatus | null;
}): boolean =>
  !isDefined(currentStatus) ||
  MESSAGE_DELIVERY_STATUS_RANK[nextStatus] >
    MESSAGE_DELIVERY_STATUS_RANK[currentStatus];
