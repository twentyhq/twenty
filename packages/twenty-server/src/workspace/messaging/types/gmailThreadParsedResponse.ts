type Message = {
  id: string;
  labels: string[];
};

export type GmailThreadParsedResponse = {
  id: string;
  messages: Message[];
  snippet: string;
  error?: {
    code: number;
    message: string;
    status: string;
  };
};
