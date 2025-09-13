import { registerEnumType } from '@nestjs/graphql';

import { ORDER_STATUS as OrderStatus } from 'src/mkt-core/order/constants';

export enum OrderStatusGraphQL {
  ON_HOLD = OrderStatus.ON_HOLD,
  PAID = OrderStatus.PAID,
  FAILED = OrderStatus.FAILED,
  CANCELLED = OrderStatus.CANCELLED,
  FULFILLED = OrderStatus.FULFILLED,
  EXPIRED = OrderStatus.EXPIRED,
  PROCESSING = OrderStatus.PROCESSING,
  COMPLETED = OrderStatus.COMPLETED,
  REFUNDED = OrderStatus.REFUNDED,
  DISPUTED = OrderStatus.DISPUTED,
  OTHER = OrderStatus.OTHER,
  TRIAL = OrderStatus.TRIAL,
}

registerEnumType(OrderStatusGraphQL, {
  name: 'OrderStatus',
  description: 'Order status enum',
  valuesMap: {
    ON_HOLD: {
      description: 'Order is pending processing',
    },
    PAID: {
      description: 'Order has been paid',
    },
    FAILED: {
      description: 'Order processing failed',
    },
    CANCELLED: {
      description: 'Order was cancelled',
    },
    FULFILLED: {
      description: 'Order has been fulfilled',
    },
    TRIAL: {
      description: 'Order is in trial period',
    },
  },
});
