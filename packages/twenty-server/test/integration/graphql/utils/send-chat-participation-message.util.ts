import { sendChatParticipationMessageOperationFactory } from 'test/integration/graphql/utils/send-chat-participation-message-operation-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export const sendChatParticipationMessage = ({
  token,
  ...message
}: Parameters<typeof sendChatParticipationMessageOperationFactory>[0] & {
  token?: string;
}) =>
  makeMetadataApiRequest(
    sendChatParticipationMessageOperationFactory(message),
    token,
  );
