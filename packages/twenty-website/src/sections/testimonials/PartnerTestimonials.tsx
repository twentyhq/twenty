import { msg } from '@lingui/core/macro';

import { NotchedCardShape, SectionShell } from '@/ui';

import { TestimonialsCarousel } from './TestimonialsCarousel';
import { PARTNER_TESTIMONIALS } from './partner-testimonials.data';

// The home Testimonials recipe: a white notched card on a muted section.
export function PartnerTestimonials() {
  return (
    <SectionShell
      background={<NotchedCardShape />}
      fullBleedBackground
      // Without it, a muted section above collapses the top padding and the notch cuts the eyebrow.
      keepsTopRhythm
      rhythm="spacious"
      scheme="muted"
    >
      <TestimonialsCarousel
        eyebrow={msg`Join our growing partner ecosystem`}
        testimonials={PARTNER_TESTIMONIALS}
      />
    </SectionShell>
  );
}
