import { styled } from '@linaria/react';

import { buildSchemeContext } from '@/tokens';
import { NotchedCardShape, SectionShell } from '@/ui';

import { PartnerTestimonialsCarousel } from './PartnerTestimonialsCarousel';
import { PARTNER_TESTIMONIALS } from './partner-testimonials.data';

// A dark notched panel on a muted section: the black card fills the section and
// its notch reveals the muted surface behind it (seamless with the muted
// section above). The carousel sits on the card, so it adopts the dark scheme
// — its text, divider, and nav resolve to light inks while the section stays
// muted through the notch.
const DarkPanel = styled.div`
  ${buildSchemeContext('dark')}
`;

export function PartnerTestimonials() {
  return (
    <SectionShell
      background={<NotchedCardShape cardScheme="dark" />}
      fullBleedBackground
      // Without it, a muted section above collapses the top padding and the notch cuts the eyebrow.
      keepsTopRhythm
      rhythm="spacious"
      scheme="muted"
    >
      <DarkPanel>
        <PartnerTestimonialsCarousel testimonials={PARTNER_TESTIMONIALS} />
      </DarkPanel>
    </SectionShell>
  );
}
