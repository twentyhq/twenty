import type { MessageBody } from '@/lib/i18n/message-body';

export type TestimonialAuthorType = {
  name: MessageBody;
  designation: MessageBody;
  avatar?: {
    src: string;
    alt?: string;
  };
  date?: Date;
};
