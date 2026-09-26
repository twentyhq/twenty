import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { stampCallRecordingApplicationId } from 'src/modules/call-recording/query-hooks/utils/stamp-call-recording-application-id.util';

const APPLICATION_ID = '00000000-0000-4000-8000-000000000001';
const FORGED_APPLICATION_ID = '00000000-0000-4000-8000-000000000002';

const workspace = { id: '00000000-0000-4000-8000-000000000010' };
const application = { id: APPLICATION_ID };

const buildAuthContext = (authContext: object) =>
  ({ workspace, ...authContext }) as unknown as WorkspaceAuthContext;

describe('stampCallRecordingApplicationId', () => {
  it('stamps the application id when an application token creates the record', () => {
    expect(
      stampCallRecordingApplicationId({
        authContext: buildAuthContext({ type: 'application', application }),
        records: [{ title: 'Weekly sync' }],
      }),
    ).toEqual([{ title: 'Weekly sync', applicationId: APPLICATION_ID }]);
  });

  it('stamps the application id when a user token issued to an application creates the record', () => {
    expect(
      stampCallRecordingApplicationId({
        authContext: buildAuthContext({ type: 'user', application }),
        records: [{ title: 'Weekly sync' }, { title: 'Demo' }],
      }),
    ).toEqual([
      { title: 'Weekly sync', applicationId: APPLICATION_ID },
      { title: 'Demo', applicationId: APPLICATION_ID },
    ]);
  });

  it('overrides a client-provided application id', () => {
    expect(
      stampCallRecordingApplicationId({
        authContext: buildAuthContext({ type: 'application', application }),
        records: [{ applicationId: FORGED_APPLICATION_ID }],
      }),
    ).toEqual([{ applicationId: APPLICATION_ID }]);
  });

  it('leaves records untouched when no application is involved', () => {
    const records = [{ title: 'Weekly sync' }];

    expect(
      stampCallRecordingApplicationId({
        authContext: buildAuthContext({ type: 'user' }),
        records,
      }),
    ).toBe(records);
  });
});
