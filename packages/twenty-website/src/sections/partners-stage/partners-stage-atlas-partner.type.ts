import { type PartnerPlace } from './resolve-partner-place';

export type PartnersStageAtlasPartner = {
  slug: string;
  name: string;
  locationLine: string;
  markUrl: string;
  place: PartnerPlace | null;
};
