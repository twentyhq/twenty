import { buildAppMessageHeaderMessageId } from 'src/engine/metadata-modules/message-channel/utils/build-app-message-header-message-id.util';

const APPLICATION_ID = '11111111-1111-4111-8111-111111111111';
const OTHER_APPLICATION_ID = '22222222-2222-4222-8222-222222222222';
const ALICE_CHANNEL_ID = '55555555-5555-4555-8555-555555555555';
const BOB_CHANNEL_ID = '66666666-6666-4666-8666-666666666666';

describe('buildAppMessageHeaderMessageId', () => {
  it('is stable for the same channel and external id, so re-ingestion dedupes', () => {
    expect(
      buildAppMessageHeaderMessageId({
        applicationId: APPLICATION_ID,
        messageChannelId: ALICE_CHANNEL_ID,
        externalId: 'msg-1',
      }),
    ).toBe(
      buildAppMessageHeaderMessageId({
        applicationId: APPLICATION_ID,
        messageChannelId: ALICE_CHANNEL_ID,
        externalId: 'msg-1',
      }),
    );
  });

  // The collision that matters: providers commonly scope message ids per
  // conversation or per account, so two members can legitimately both send
  // "1". Merging those would discard one body and attach the other member's
  // channel to it.
  it('separates two members whose provider reuses the same external id', () => {
    expect(
      buildAppMessageHeaderMessageId({
        applicationId: APPLICATION_ID,
        messageChannelId: ALICE_CHANNEL_ID,
        externalId: '1',
      }),
    ).not.toBe(
      buildAppMessageHeaderMessageId({
        applicationId: APPLICATION_ID,
        messageChannelId: BOB_CHANNEL_ID,
        externalId: '1',
      }),
    );
  });

  it('separates two apps that happen to use the same external id', () => {
    expect(
      buildAppMessageHeaderMessageId({
        applicationId: APPLICATION_ID,
        messageChannelId: ALICE_CHANNEL_ID,
        externalId: 'msg-1',
      }),
    ).not.toBe(
      buildAppMessageHeaderMessageId({
        applicationId: OTHER_APPLICATION_ID,
        messageChannelId: ALICE_CHANNEL_ID,
        externalId: 'msg-1',
      }),
    );
  });

  it('cannot collide with an RFC822 header message id', () => {
    expect(
      buildAppMessageHeaderMessageId({
        applicationId: APPLICATION_ID,
        messageChannelId: ALICE_CHANNEL_ID,
        externalId: 'msg-1',
      }),
    ).toMatch(/^app:/);
  });
});
