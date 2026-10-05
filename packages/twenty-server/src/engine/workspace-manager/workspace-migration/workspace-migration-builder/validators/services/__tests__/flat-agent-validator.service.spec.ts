import { type AgentTrigger } from 'twenty-shared/application';

import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { FlatAgentValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-agent-validator.service';

const AGENT_UNIVERSAL_IDENTIFIER = 'agent-universal-identifier';
const OWNER_APPLICATION_UNIVERSAL_IDENTIFIER = 'owner-application';

const CRON_TRIGGER: AgentTrigger = {
  id: '0d2b1a8c-77a4-4e2e-8f0c-3a8e9f6b4c22',
  type: 'CRON',
  isActive: true,
  instructions: null,
  settings: { pattern: '0 9 * * 1' },
};

const flatAgentMaps = addFlatEntityToFlatEntityMapsOrThrow({
  flatEntity: {
    id: 'agent-id',
    universalIdentifier: AGENT_UNIVERSAL_IDENTIFIER,
    applicationUniversalIdentifier: OWNER_APPLICATION_UNIVERSAL_IDENTIFIER,
    name: 'enricher',
    label: 'Enricher',
    prompt: 'Enrich companies',
    modelId: 'auto',
    triggers: [],
  } as never,
  flatEntityMaps: createEmptyFlatEntityMaps(),
});

const validateTriggersUpdate = ({
  triggers,
  callerApplicationUniversalIdentifier,
}: {
  triggers: unknown;
  callerApplicationUniversalIdentifier: string;
}) =>
  new FlatAgentValidatorService().validateFlatAgentUpdate({
    universalIdentifier: AGENT_UNIVERSAL_IDENTIFIER,
    flatEntityUpdate: { triggers } as never,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatAgentMaps,
    } as never,
    buildOptions: {
      applicationUniversalIdentifier: callerApplicationUniversalIdentifier,
    } as never,
  } as never);

describe('FlatAgentValidatorService', () => {
  it('should let the owning application change triggers', () => {
    const { errors } = validateTriggersUpdate({
      triggers: [CRON_TRIGGER],
      callerApplicationUniversalIdentifier:
        OWNER_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    expect(errors).toEqual([]);
  });

  it('should refuse trigger changes from another application', () => {
    const { errors } = validateTriggersUpdate({
      triggers: [CRON_TRIGGER],
      callerApplicationUniversalIdentifier: 'other-application',
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(AiExceptionCode.RUN_AGENT_NOT_ALLOWED);
  });

  it('should refuse null triggers instead of skipping their validation', () => {
    const { errors } = validateTriggersUpdate({
      triggers: null,
      callerApplicationUniversalIdentifier:
        OWNER_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(AiExceptionCode.INVALID_AGENT_INPUT);
  });
});
