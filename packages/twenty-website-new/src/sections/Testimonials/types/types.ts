import type { MessageDescriptor } from '@lingui/core';

type TestimonialAuthorType = {
  name: MessageDescriptor;
  designation: MessageDescriptor;
  avatar?: {
    src: string;
    alt?: string;
  };
  date?: Date;
};

export type TestimonialCardType = {
  heading: MessageDescriptor;
  author: TestimonialAuthorType;
};
