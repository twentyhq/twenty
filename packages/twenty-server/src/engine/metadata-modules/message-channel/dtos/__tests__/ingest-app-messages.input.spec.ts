import { GraphQLISODateTime } from '@nestjs/graphql';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { MessageParticipantRole } from 'twenty-shared/types';

import {
  IngestAppMessagesInput,
  MAX_APP_MESSAGE_ATTACHMENTS_PER_MESSAGE,
} from 'src/engine/metadata-modules/message-channel/dtos/ingest-app-messages.input';

const MESSAGE_CHANNEL_ID = '55555555-5555-4555-8555-555555555555';

const anInput = (receivedAt: unknown) => ({
  messageChannelId: MESSAGE_CHANNEL_ID,
  messages: [
    {
      externalId: 'urn:li:message:1',
      threadExternalId: 'urn:li:conversation:1',
      text: 'Are you free at 3?',
      receivedAt,
      participants: [
        {
          role: MessageParticipantRole.FROM,
          handle: 'urn:li:person:ada',
        },
      ],
    },
  ],
});

const validationErrors = (receivedAt: unknown) =>
  validate(plainToInstance(IngestAppMessagesInput, anInput(receivedAt)));

// receivedAt's wire type differs from what the validator checks, so it can silently reject every call
describe('IngestAppMessagesInput receivedAt', () => {
  it('accepts what the GraphQL DateTime scalar produces', async () => {
    const fromTheScalar = GraphQLISODateTime.parseValue(
      '2026-09-14T10:00:00.000Z',
    );

    expect(await validationErrors(fromTheScalar)).toHaveLength(0);
  });

  it('accepts a raw ISO string, so the contract does not rely on the scalar', async () => {
    expect(await validationErrors('2026-09-14T10:00:00.000Z')).toHaveLength(0);
  });

  it('rejects a value that is not a date at all', async () => {
    expect(await validationErrors('not a date')).not.toHaveLength(0);
  });
});

const attachmentValidationErrors = (
  attachments: { fileId: string; label: string }[],
) => {
  const input = anInput('2026-09-14T10:00:00.000Z');

  return validate(
    plainToInstance(IngestAppMessagesInput, {
      ...input,
      messages: [{ ...input.messages[0], attachments }],
    }),
  );
};

describe('IngestAppMessagesInput attachments', () => {
  it('accepts uploaded files', async () => {
    expect(
      await attachmentValidationErrors([
        { fileId: '66666666-6666-4666-8666-666666666666', label: 'photo.png' },
      ]),
    ).toHaveLength(0);
  });

  it('rejects a file id that is not a uuid', async () => {
    expect(
      await attachmentValidationErrors([
        { fileId: 'photo.png', label: 'photo.png' },
      ]),
    ).not.toHaveLength(0);
  });

  it('rejects more files than a message holds', async () => {
    expect(
      await attachmentValidationErrors(
        Array.from(
          { length: MAX_APP_MESSAGE_ATTACHMENTS_PER_MESSAGE + 1 },
          () => ({
            fileId: '66666666-6666-4666-8666-666666666666',
            label: 'photo.png',
          }),
        ),
      ),
    ).not.toHaveLength(0);
  });
});
