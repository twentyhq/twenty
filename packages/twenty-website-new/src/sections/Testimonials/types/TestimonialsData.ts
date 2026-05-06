import type { MessageEyebrow } from '@/lib/i18n/message-eyebrow';
import type { TestimonialCardType } from '@/sections/Testimonials/types/TestimonialCard';

export type TestimonialsDataType = {
  eyebrow: MessageEyebrow;
  testimonials: TestimonialCardType[];
};
