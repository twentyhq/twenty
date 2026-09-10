export type CampaignBatchSendOutcome = {
  entries: {
    recipientIndex: number;
    messageId: string | null;
    errorMessage: string | null;
  }[];
  suppressedRecipientIndexes: number[];
};
