export type MicrosoftGraphBatchResponse<TBody> = {
  responses: {
    id: string;
    status: number;
    body?: TBody;
  }[];
};
