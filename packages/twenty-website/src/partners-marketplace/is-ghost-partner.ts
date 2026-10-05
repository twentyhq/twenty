import { type MarketplacePartner } from './marketplace-partner';

const GHOST_INTRODUCTION_MAX_LENGTH = 40;

export const isGhost = (p: MarketplacePartner): boolean =>
  p.description.trim().length < GHOST_INTRODUCTION_MAX_LENGTH &&
  !p.profilePictureUrl;
