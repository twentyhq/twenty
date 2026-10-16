import { partnerSchema } from './partner-schema';

const PARTNER_QUERY_PARAM = 'via';

export const readPartnerFromUrl = (): string | undefined =>
  partnerSchema.safeParse(
    new URLSearchParams(window.location.search).get(PARTNER_QUERY_PARAM),
  ).data;
