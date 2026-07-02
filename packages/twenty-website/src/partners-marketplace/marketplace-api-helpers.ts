export type CurrencyValue = { amountMicros: number; currencyCode: string } | null;
export type LinkValue = { primaryLinkUrl: string | null } | null;

export const normalizeUrl = (raw: string | null | undefined): string => {
  if (!raw) {
    return '';
  }

  return raw.includes('://') ? raw : `https://${raw}`;
};

export const linkUrl = (link: LinkValue): string =>
  normalizeUrl(link?.primaryLinkUrl ?? '');

export const microsToUsd = (currency: CurrencyValue): number | null =>
  currency && typeof currency.amountMicros === 'number'
    ? Math.round(currency.amountMicros / 1_000_000)
    : null;
