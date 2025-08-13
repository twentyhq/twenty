import { registerEnumType } from '@nestjs/graphql';

import { OrderStatus } from 'src/mkt-core/order/constants';

export enum OrderStatusGraphQL {
  PENDING = OrderStatus.PENDING,
  PAID = OrderStatus.PAID,
  FAILED = OrderStatus.FAILED,
  CANCELLED = OrderStatus.CANCELLED,
  FULFILLED = OrderStatus.FULFILLED,
}

registerEnumType(OrderStatusGraphQL, {
  name: 'OrderStatus',
  description: 'Order status enum',
  valuesMap: {
    PENDING: {
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
  },
});
