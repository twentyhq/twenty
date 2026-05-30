import { msg } from '@lingui/core/macro';

import { HOME_TESTIMONIALS } from '@/app/[locale]/(home)/testimonials.data';
import { getServerI18n } from '@/lib/i18n/server';
import {
  TestimonialsCarousel,
  TestimonialsHourglassVisual,
  TestimonialsSection,
} from '@/sections/Testimonials';

export function HomeTestimonials() {
  const i18n = getServerI18n();

  return (
    <TestimonialsSection scheme="muted">
      <TestimonialsCarousel
        eyebrow={i18n._(msg`They are the real sales`)}
        testimonials={HOME_TESTIMONIALS}
      >
        <TestimonialsHourglassVisual />
      </TestimonialsCarousel>
    </TestimonialsSection>
  );
}
