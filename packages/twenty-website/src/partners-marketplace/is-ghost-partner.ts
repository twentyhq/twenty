import { type MarketplacePartner } from './marketplace-partner';

export const isGhost = (p: MarketplacePartner): boolean =>
  p.description.trim().length < 40 && !p.profilePictureUrl;
