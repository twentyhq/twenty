type Message = {
  id: string;
  labels: string[];
};

export type GmailThreadParsedResponse = {
  id: string;
  messages: Message[];
  error?: {
    code: number;
    message: string;
    status: string;
  };
};
