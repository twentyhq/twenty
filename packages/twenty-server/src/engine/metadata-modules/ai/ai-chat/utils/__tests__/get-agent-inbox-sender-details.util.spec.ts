import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { getAgentInboxSenderDetails } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-inbox-sender-details.util';

describe('getAgentInboxSenderDetails', () => {
  it('attributes an application message to the application', () => {
    expect(
      getAgentInboxSenderDetails({
        type: 'application',
        application: {
          id: 'application-id',
          name: 'Call recorder',
        } as FlatApplication,
      }),
    ).toEqual({
      key: 'application-id',
      applicationId: 'application-id',
      description: 'The "Call recorder" application',
    });
  });

  it('keeps workflow conversations apart from application ones', () => {
    expect(
      getAgentInboxSenderDetails({
        type: 'workflow',
        workflowId: 'application-id',
        workflowName: 'Welcome new deals',
      }),
    ).toEqual({
      key: 'workflow:application-id',
      applicationId: null,
      description: 'The "Welcome new deals" workflow',
    });
  });
});
