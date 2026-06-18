import { NotchedCardShape, SectionShell } from '@/ui';

import { TestimonialsCarousel } from './TestimonialsCarousel';
import { TESTIMONIALS } from './testimonials.data';

export function Testimonials() {
  return (
    <SectionShell
      background={<NotchedCardShape />}
      rhythm="spacious"
      scheme="muted"
    >
      <TestimonialsCarousel testimonials={TESTIMONIALS} />
    </SectionShell>
  );
}
