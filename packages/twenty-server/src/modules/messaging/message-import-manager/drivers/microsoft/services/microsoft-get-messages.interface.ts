export interface MicrosoftGraphBatchResponse {
  responses: {
    id: string;
    status: number;
    headers?: {
      'Cache-Control': string;
      'Content-Type': string;
    };
    body?: {
      '@odata.context'?: string;
      '@odata.etag'?: string;
      id?: string;
      createdDateTime?: string;
      lastModifiedDateTime?: string;
      changeKey?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      categories?: any[];
      receivedDateTime?: string;
      sentDateTime?: string;
      hasAttachments?: boolean;
      internetMessageId?: string;
      subject?: string;
      bodyPreview?: string;
      importance?: string;
      parentFolderId?: string;
      conversationId?: string;
      conversationIndex?: string;
      isDeliveryReceiptRequested?: boolean | null;
      isReadReceiptRequested?: boolean;
      isRead?: boolean;
      isDraft?: boolean;
      webLink?: string;
      inferenceClassification?: string;
      body?: {
        contentType?: string;
        content?: string;
      };
      sender?: {
        emailAddress?: {
          name?: string;
          address?: string;
        };
      };
    };
  }[];
}
