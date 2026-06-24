type Participant = {
  avatarUrl: string;
  name: string;
};

export type EmailThread = {
  date: string;
  messageCount: number;
  participants: Participant[];
  preview?: string;
  shared: boolean;
  subject?: string;
};
