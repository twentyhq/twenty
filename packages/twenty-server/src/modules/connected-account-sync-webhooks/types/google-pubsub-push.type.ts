export type GooglePubSubPushMessage = {
  message?: {
    data?: string;
    messageId?: string;
    publishTime?: string;
  };
  subscription?: string;
};

export type GmailPushDecodedData = {
  emailAddress: string;
  historyId: string | number;
};
