import { registerEnumType } from '@nestjs/graphql';

import { ORDER_STATUS as OrderStatus } from 'src/mkt-core/order/constants';

export enum OrderStatusGraphQL {
  PAID = OrderStatus.PAID,
  CANCELLED = OrderStatus.CANCELLED,
  PROCESSING = OrderStatus.PROCESSING,
  COMPLETED = OrderStatus.COMPLETED,
  TRIAL = OrderStatus.TRIAL,
  LOCKED = OrderStatus.LOCKED,
  DRAFT = OrderStatus.DRAFT,
  CONFIRMED = OrderStatus.CONFIRMED,
}

registerEnumType(OrderStatusGraphQL, {
  name: 'OrderStatus',
  description: 'Order status enum',
  valuesMap: {
    PAID: {
      description: 'Order has been paid',
    },
    CANCELLED: {
      description: 'Order was cancelled',
    },
    TRIAL: {
      description: 'Order is in trial period',
    },
    LOCKED: {
      description: 'Order is locked',
    },
    DRAFT: {
      description: 'Order is draft',
    },
  },
});
