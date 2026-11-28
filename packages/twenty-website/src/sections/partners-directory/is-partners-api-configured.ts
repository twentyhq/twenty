// Whether this deployment can reach the partners API: production has its URL
// and key; local runs and previews may have neither, and show the snapshot.
export const isPartnersApiConfigured = (): boolean =>
  Boolean(process.env.TWENTY_PARTNERS_API_URL) &&
  Boolean(process.env.TWENTY_PARTNERS_API_KEY);
