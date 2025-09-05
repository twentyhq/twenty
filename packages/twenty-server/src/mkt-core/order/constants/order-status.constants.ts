import { TagColor } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  FULFILLED = 'FULFILLED',
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

export enum SINVOICE_STATUS {
  PENDING = 'PENDING',
  SEND = 'SEND',
  FAILED = 'FAILED',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

export const SINVOICE_STATUS_OPTIONS = [
  {
    value: SINVOICE_STATUS.PENDING,
    label: 'Pending',
    color: 'orange' as TagColor,
    position: 0,
  },
  {
    value: SINVOICE_STATUS.SEND,
    label: 'Send',
    color: 'blue' as TagColor,
    position: 1,
  },
  {
    value: SINVOICE_STATUS.FAILED,
    label: 'Failed',
    color: 'red' as TagColor,
    position: 2,
  },
  {
    value: SINVOICE_STATUS.ERROR,
    label: 'Error',
    color: 'gray' as TagColor,
    position: 3,
  },
  {
    value: SINVOICE_STATUS.SUCCESS,
    label: 'Success',
    color: 'green' as TagColor,
    position: 4,
  },
]
