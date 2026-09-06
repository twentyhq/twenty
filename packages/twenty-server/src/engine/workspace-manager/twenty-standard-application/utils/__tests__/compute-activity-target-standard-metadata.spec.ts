import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { validateAndReturnIndexWhereClause } from 'src/engine/workspace-manager/workspace-migration/utils/validate-index-where-clause.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const TWENTY_STANDARD_APPLICATION_ID = '20202020-2222-4222-8222-222222222222';
const NOW = '2024-01-01T00:00:00.000Z';

describe('Activity target standard metadata build', () => {
  const { allFlatEntityMaps } =
    computeTwentyStandardApplicationAllFlatEntityMaps({
      now: NOW,
      workspaceId: WORKSPACE_ID,
      twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
    });

  it.each([
    {
      field: STANDARD_OBJECTS.company.fields.taskTargets,
      fieldName: 'company.taskTargets',
    },
    {
      field: STANDARD_OBJECTS.company.fields.noteTargets,
      fieldName: 'company.noteTargets',
    },
    {
      field: STANDARD_OBJECTS.person.fields.taskTargets,
      fieldName: 'person.taskTargets',
    },
    {
      field: STANDARD_OBJECTS.person.fields.noteTargets,
      fieldName: 'person.noteTargets',
    },
    {
      field: STANDARD_OBJECTS.opportunity.fields.taskTargets,
      fieldName: 'opportunity.taskTargets',
    },
    {
      field: STANDARD_OBJECTS.opportunity.fields.noteTargets,
      fieldName: 'opportunity.noteTargets',
    },
  ])('marks $fieldName as UI-editable', ({ field }) => {
    const fieldMetadata =
      allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        field.universalIdentifier
      ];

    expect(fieldMetadata?.isUIEditable).toBe(true);
  });

  it.each([
    {
      objectName: 'taskTarget',
      indexes: [
        STANDARD_OBJECTS.taskTarget.indexes.taskPersonUniqueIndex,
        STANDARD_OBJECTS.taskTarget.indexes.taskCompanyUniqueIndex,
        STANDARD_OBJECTS.taskTarget.indexes.taskOpportunityUniqueIndex,
      ],
    },
    {
      objectName: 'noteTarget',
      indexes: [
        STANDARD_OBJECTS.noteTarget.indexes.notePersonUniqueIndex,
        STANDARD_OBJECTS.noteTarget.indexes.noteCompanyUniqueIndex,
        STANDARD_OBJECTS.noteTarget.indexes.noteOpportunityUniqueIndex,
      ],
    },
  ] as const)(
    'allows only one live $objectName row per target',
    ({ indexes }) => {
      for (const { universalIdentifier } of indexes) {
        const indexMetadata =
          allFlatEntityMaps.flatIndexMaps.byUniversalIdentifier[
            universalIdentifier
          ];

        expect(indexMetadata).toMatchObject({ isUnique: true });
        expect(indexMetadata?.indexWhereClause).toBe('"deletedAt" IS NULL');
        expect(
          validateAndReturnIndexWhereClause(indexMetadata?.indexWhereClause),
        ).toBe('"deletedAt" IS NULL');
      }
    },
  );
});
