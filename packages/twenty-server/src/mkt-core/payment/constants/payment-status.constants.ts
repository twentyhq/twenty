import { TagColor } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';

export const PAYMENT_STATUS_OPTIONS = [
  {
    value: 'PENDING',
    label: 'Pending',
    position: 0,
    color: 'orange' as TagColor,
  },
  {
    value: 'PROCESSING',
    label: 'Processing',
    position: 1,
    color: 'blue' as TagColor,
  },
  {
    value: 'COMPLETED',
    label: 'Completed',
    position: 2,
    color: 'green' as TagColor,
  },
  { value: 'FAILED', label: 'Failed', position: 3, color: 'red' as TagColor },
  {
    value: 'CANCELLED',
    label: 'Cancelled',
    position: 4,
    color: 'gray' as TagColor,
  },
  {
    value: 'REFUNDED',
    label: 'Refunded',
    position: 5,
    color: 'purple' as TagColor,
  },
];
