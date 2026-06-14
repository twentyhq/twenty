import { msg } from '@lingui/core/macro';

import { PARTNER_TESTIMONIALS } from '@/app/[locale]/partners/testimonials.data';
import { getServerI18n } from '@/lib/i18n/server';
import {
  TestimonialsPartnerCarousel,
  TestimonialsPartnerVisual,
} from '@/sections/Testimonials';
import { TestimonialsSection } from '@/templates/Testimonials';
import { theme } from '@/theme';

export function PartnerTestimonials() {
  const i18n = getServerI18n();

  return (
    <TestimonialsSection
      scheme="muted"
      shapeFillColor={theme.colors.secondary.background[100]}
    >
      <TestimonialsPartnerCarousel
        eyebrow={i18n._(msg`Join our growing partner ecosystem`)}
        testimonials={PARTNER_TESTIMONIALS}
      >
        <TestimonialsPartnerVisual />
      </TestimonialsPartnerCarousel>
    </TestimonialsSection>
  );
}
