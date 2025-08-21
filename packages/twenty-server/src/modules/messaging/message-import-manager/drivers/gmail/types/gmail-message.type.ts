export type Participant = {
  role: 'from' | 'to' | 'cc' | 'bcc';
  handle: string;
  displayName: string;
};

export type ParticipantWithMessageId = Participant & { messageId: string };
