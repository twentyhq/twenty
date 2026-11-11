import { FieldMetadataType } from 'twenty-shared/types';

import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { getDatabaseEventTriggerConditionIssues } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/get-database-event-trigger-condition-issues.util';
import {
  type WorkflowTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const OPPORTUNITY_OBJECT_ID = 'opportunity-object';

const flatObjectMetadataMaps = addAllFlatEntitiesToFlatEntityMaps({
  flatEntities: [
    getFlatObjectMetadataMock({
      id: OPPORTUNITY_OBJECT_ID,
      universalIdentifier: OPPORTUNITY_OBJECT_ID,
      nameSingular: 'opportunity',
      fieldIds: ['field-stage'],
    }),
  ],
  flatEntityMaps: createEmptyFlatEntityMaps(),
});

const flatFieldMetadataMaps = addAllFlatEntitiesToFlatEntityMaps({
  flatEntities: [
    getFlatFieldMetadataMock({
      id: 'field-stage',
      universalIdentifier: 'field-stage',
      objectMetadataId: OPPORTUNITY_OBJECT_ID,
      name: 'stage',
      type: FieldMetadataType.TEXT,
    }),
  ],
  flatEntityMaps: createEmptyFlatEntityMaps(),
});

const buildTrigger = (
  eventName: string,
  condition?: string,
): WorkflowTrigger => ({
  name: 'Record is updated',
  type: WorkflowTriggerType.DATABASE_EVENT,
  settings: { eventName, condition, outputSchema: {} },
});

const getIssues = (trigger: WorkflowTrigger) =>
  getDatabaseEventTriggerConditionIssues({
    trigger,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    objectIdByNameSingular: { opportunity: OPPORTUNITY_OBJECT_ID },
  });

describe('getDatabaseEventTriggerConditionIssues', () => {
  it('accepts a condition that compiles against the object', () => {
    expect(
      getIssues(
        buildTrigger(
          'opportunity.updated',
          'stage == "WON" and previous.stage != "WON"',
        ),
      ),
    ).toEqual([]);
  });

  it('blocks a condition reading a field the object lacks', () => {
    expect(
      getIssues(buildTrigger('opportunity.updated', 'amount > 0')),
    ).toEqual([
      expect.objectContaining({
        code: 'INVALID_TRIGGER_PARAMS',
        path: 'settings.condition',
        message: expect.stringContaining('Unknown field "amount"'),
      }),
    ]);
  });

  it('skips triggers without a condition and wildcard triggers', () => {
    expect(getIssues(buildTrigger('opportunity.updated'))).toEqual([]);
    expect(getIssues(buildTrigger('opportunity.updated', '  '))).toEqual([]);
    expect(getIssues(buildTrigger('*.updated', 'amount > 0'))).toEqual([]);
  });
});
