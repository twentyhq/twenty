import type { MessageHeadingSegment } from '@/lib/i18n/message-heading-segment';
import type { TestimonialAuthorType } from '@/sections/Testimonials/types/TestimonialAuthor';

export type TestimonialCardType = {
  heading: MessageHeadingSegment;
  author: TestimonialAuthorType;
};
