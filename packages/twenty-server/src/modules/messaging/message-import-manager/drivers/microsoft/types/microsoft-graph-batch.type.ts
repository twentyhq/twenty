import {
  type BatchResponseBody,
  type PageCollection,
} from '@microsoft/microsoft-graph-client';

import {
  type Message,
  type PublicErrorResponse,
} from '@microsoft/microsoft-graph-types-beta';

type MicrosoftGraphBatchSubResponse<TBody> = {
  id: string;
  status: number;
  body?: TBody;
};

export type MicrosoftGraphBatchResponse<TBody> = Omit<
  BatchResponseBody,
  'responses'
> & {
  responses: MicrosoftGraphBatchSubResponse<TBody>[];
};

type MicrosoftGraphDeltaMessage = Pick<Message, 'id'> & {
  '@removed'?: { reason?: string };
};

export type MicrosoftGraphDeltaListResponseBody = PublicErrorResponse &
  Pick<PageCollection, '@odata.nextLink' | '@odata.deltaLink'> & {
    value?: MicrosoftGraphDeltaMessage[];
  };
