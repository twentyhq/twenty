export const CURRENCY_FORMAT = ['short', 'full'] as const;

export type CurrencyFormat = (typeof CURRENCY_FORMAT)[number];

export type FieldMetadataCurrencySettings = {
  format?: CurrencyFormat | null;
};

