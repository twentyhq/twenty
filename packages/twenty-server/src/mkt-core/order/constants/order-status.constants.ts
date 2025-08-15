import { TagColor } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  FULFILLED = 'fulfilled',
}

export const ORDER_STATUS_OPTIONS = [
  {
    value: OrderStatus.PENDING,
    label: 'Pending',
    color: 'gray' as TagColor,
    position: 0,
  },
  {
    value: OrderStatus.PAID,
    label: 'Paid',
    color: 'green' as TagColor,
    position: 1,
  },
  {
    value: OrderStatus.FAILED,
    label: 'Failed',
    color: 'red' as TagColor,
    position: 2,
  },
  {
    value: OrderStatus.CANCELLED,
    label: 'Cancelled',
    color: 'orange' as TagColor,
    position: 3,
  },
  {
    value: OrderStatus.FULFILLED,
    label: 'Fulfilled',
    color: 'blue' as TagColor,
    position: 4,
  },
];
