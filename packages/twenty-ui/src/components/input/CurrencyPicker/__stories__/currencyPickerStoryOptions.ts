import { type CurrencyPickerOption } from '../types/CurrencyPickerOption';

export const CURRENCY_PICKER_STORY_OPTIONS = [
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound', disabled: true },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'USD', name: 'US Dollar' },
] satisfies CurrencyPickerOption[];
