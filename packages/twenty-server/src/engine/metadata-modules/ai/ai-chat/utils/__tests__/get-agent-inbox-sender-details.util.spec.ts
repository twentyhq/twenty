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
      key: 'application:application-id',
      applicationId: 'application-id',
      description: 'The "Call recorder" application',
    });
  });

  it('attributes a workflow message to no application', () => {
    expect(
      getAgentInboxSenderDetails({
        type: 'workflow',
        workflowId: 'workflow-id',
        workflowName: 'Welcome new deals',
      }),
    ).toEqual({
      key: 'workflow:workflow-id',
      applicationId: null,
      description: 'The "Welcome new deals" workflow',
    });
  });
});
