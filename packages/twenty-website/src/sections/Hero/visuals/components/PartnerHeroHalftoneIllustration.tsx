'use client';

import { PartnerHalftoneOverlay } from '@/sections/Hero/components/PartnerVisual/PartnerHalftoneOverlay';

const HERO_PARTNER_IMAGE_URL = '/images/partner/hero/partners-hero.webp';

export function PartnerHeroHalftoneIllustration() {
  return <PartnerHalftoneOverlay imageUrl={HERO_PARTNER_IMAGE_URL} />;
}
