import { styled } from '@linaria/react';

import { buildSchemeContext } from '@/tokens';
import { NotchedCardShape, SectionShell } from '@/ui';

import { PartnerTestimonialsCarousel } from './PartnerTestimonialsCarousel';
import { PARTNER_TESTIMONIALS } from './partner-testimonials.data';

// A dark notched panel on a light section: the black card fills the section and
// its notch reveals the white surface behind it (seamless with the white
// section above). The carousel sits on the card, so it adopts the dark scheme
// — its text, divider, and nav resolve to light inks while the section stays
// white through the notch.
const DarkPanel = styled.div`
  ${buildSchemeContext('dark')}
`;

export function PartnerTestimonials() {
  return (
    <SectionShell
      background={<NotchedCardShape cardScheme="dark" />}
      fullBleedBackground
      rhythm="spacious"
      scheme="light"
    >
      <DarkPanel>
        <PartnerTestimonialsCarousel testimonials={PARTNER_TESTIMONIALS} />
      </DarkPanel>
    </SectionShell>
  );
}
