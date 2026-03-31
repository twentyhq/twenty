import type { EyebrowType } from '@/design-system/components/Eyebrow/types/Eyebrow';
import type { IllustrationType } from '@/design-system/components/Illustration/types/Illustration';
import type { TestimonialCardType } from '@/sections/Testimonials/types/TestimonialCard';

export type TestimonialsDataType = {
  eyebrow: EyebrowType;
  testimonials: TestimonialCardType[];
  illustration: IllustrationType;
};
