import { TagColor } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';

export const PAYMENT_METHOD_TYPE_OPTIONS = [
  {
    value: 'CREDIT_CARD',
    label: 'Credit Card',
    position: 0,
    color: 'blue' as TagColor,
  },
  {
    value: 'DEBIT_CARD',
    label: 'Debit Card',
    position: 1,
    color: 'green' as TagColor,
  },
  {
    value: 'BANK_TRANSFER',
    label: 'Bank Transfer',
    position: 2,
    color: 'purple' as TagColor,
  },
  {
    value: 'PAYPAL',
    label: 'PayPal',
    position: 3,
    color: 'orange' as TagColor,
  },
  { value: 'STRIPE', label: 'Stripe', position: 4, color: 'blue' as TagColor },
  { value: 'CASH', label: 'Cash', position: 5, color: 'gray' as TagColor },
  { value: 'CHECK', label: 'Check', position: 6, color: 'yellow' as TagColor },
  {
    value: 'CRYPTOCURRENCY',
    label: 'Cryptocurrency',
    position: 7,
    color: 'yellow' as TagColor,
  },
  { value: 'OTHER', label: 'Other', position: 8, color: 'gray' as TagColor },
];
