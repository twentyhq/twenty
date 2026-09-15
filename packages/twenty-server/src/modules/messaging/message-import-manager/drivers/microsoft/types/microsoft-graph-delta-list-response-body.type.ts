export type MicrosoftGraphDeltaListResponseBody = {
  value?: { id?: string; '@removed'?: { reason?: string } }[];
  '@odata.nextLink'?: string;
  '@odata.deltaLink'?: string;
  error?: { code?: string; message?: string };
};
