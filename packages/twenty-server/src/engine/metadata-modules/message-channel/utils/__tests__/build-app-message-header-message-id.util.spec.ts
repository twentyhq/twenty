import { buildAppMessageHeaderMessageId } from 'src/engine/metadata-modules/message-channel/utils/build-app-message-header-message-id.util';

const APPLICATION_ID = '11111111-1111-4111-8111-111111111111';
const OTHER_APPLICATION_ID = '22222222-2222-4222-8222-222222222222';

describe('buildAppMessageHeaderMessageId', () => {
  it('is stable for the same app and external id, so re-ingestion dedupes', () => {
    expect(
      buildAppMessageHeaderMessageId({
        applicationId: APPLICATION_ID,
        externalId: 'msg-1',
      }),
    ).toBe(
      buildAppMessageHeaderMessageId({
        applicationId: APPLICATION_ID,
        externalId: 'msg-1',
      }),
    );
  });

  it('separates two apps that happen to use the same external id', () => {
    expect(
      buildAppMessageHeaderMessageId({
        applicationId: APPLICATION_ID,
        externalId: 'msg-1',
      }),
    ).not.toBe(
      buildAppMessageHeaderMessageId({
        applicationId: OTHER_APPLICATION_ID,
        externalId: 'msg-1',
      }),
    );
  });

  it('cannot collide with an RFC822 header message id', () => {
    expect(
      buildAppMessageHeaderMessageId({
        applicationId: APPLICATION_ID,
        externalId: 'msg-1',
      }),
    ).toMatch(/^app:/);
  });
});
