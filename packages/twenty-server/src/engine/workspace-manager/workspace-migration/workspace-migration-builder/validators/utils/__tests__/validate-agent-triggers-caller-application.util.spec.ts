import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { validateAgentTriggersCallerApplication } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-agent-triggers-caller-application.util';

const OWNER_APPLICATION_UNIVERSAL_IDENTIFIER = 'owner-application';

describe('validateAgentTriggersCallerApplication', () => {
  it('should let the owning application change triggers', () => {
    expect(
      validateAgentTriggersCallerApplication({
        callerApplicationUniversalIdentifier:
          OWNER_APPLICATION_UNIVERSAL_IDENTIFIER,
        agentApplicationUniversalIdentifier:
          OWNER_APPLICATION_UNIVERSAL_IDENTIFIER,
      }),
    ).toEqual([]);
  });

  it('should let the standard application change triggers', () => {
    expect(
      validateAgentTriggersCallerApplication({
        callerApplicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION.universalIdentifier,
        agentApplicationUniversalIdentifier:
          OWNER_APPLICATION_UNIVERSAL_IDENTIFIER,
      }),
    ).toEqual([]);
  });

  it('should refuse trigger changes from another application', () => {
    const errors = validateAgentTriggersCallerApplication({
      callerApplicationUniversalIdentifier: 'other-application',
      agentApplicationUniversalIdentifier:
        OWNER_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]?.code).toBe(AiExceptionCode.RUN_AGENT_NOT_ALLOWED);
  });
});
