import { type MessageDescriptor } from '@lingui/core';

type Participant = {
  avatarUrl: string;
  name: string;
};

export type EmailThread = {
  date: string;
  messageCount: number;
  participants: Participant[];
  preview: MessageDescriptor;
  subject: MessageDescriptor;
};
