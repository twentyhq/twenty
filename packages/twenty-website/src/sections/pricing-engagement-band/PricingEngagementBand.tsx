import { msg } from '@lingui/core/macro';

import { PartnerEngagementBand } from '@/partners-marketplace/PartnerEngagementBand';

export function PricingEngagementBand() {
  return (
    <PartnerEngagementBand
      heading={msg`Need help with customization?`}
      body={msg`Find the right partner to implement, customize, and tailor Twenty to your team.`}
      ctaLabel={msg`Find a partner`}
      ctaHref="/partners/list"
      overlayImageSrc="/images/pricing/engagement-band/halftone-on-white.webp"
    />
  );
}
