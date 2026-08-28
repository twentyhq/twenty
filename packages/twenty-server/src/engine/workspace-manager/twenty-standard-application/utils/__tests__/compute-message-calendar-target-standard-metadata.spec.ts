import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { validateAndReturnIndexWhereClause } from 'src/engine/workspace-manager/workspace-migration/utils/validate-index-where-clause.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const TWENTY_STANDARD_APPLICATION_ID = '20202020-2222-4222-8222-222222222222';
const NOW = '2024-01-01T00:00:00.000Z';

describe('Message and calendar target standard metadata build', () => {
  const { allFlatEntityMaps } =
    computeTwentyStandardApplicationAllFlatEntityMaps({
      now: NOW,
      workspaceId: WORKSPACE_ID,
      twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
    });

  it.each(['calendarEventTarget', 'messageThreadTarget'] as const)(
    'builds %s as a system junction object without first-class views',
    (objectName) => {
      const objectMetadata =
        allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS[objectName].universalIdentifier
        ];

      expect(objectMetadata).toMatchObject({
        isSystem: true,
        isAuditLogged: false,
        isUICreatable: false,
      });
      expect(Object.keys(STANDARD_OBJECTS[objectName].views)).toHaveLength(0);
    },
  );

  it.each([
    {
      parentObjectName: 'calendarEvent',
      parentTargetField:
        STANDARD_OBJECTS.calendarEvent.fields.calendarEventTargets,
      targetField: STANDARD_OBJECTS.calendarEventTarget.fields.targetPerson,
    },
    {
      parentObjectName: 'messageThread',
      parentTargetField:
        STANDARD_OBJECTS.messageThread.fields.messageThreadTargets,
      targetField: STANDARD_OBJECTS.messageThreadTarget.fields.targetPerson,
    },
  ] as const)(
    'configures $parentObjectName targets for the generic junction relation path',
    ({ parentTargetField, targetField }) => {
      const parentTargetFieldMetadata =
        allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
          parentTargetField.universalIdentifier
        ];

      expect(parentTargetFieldMetadata).toMatchObject({
        universalSettings: {
          junctionTargetFieldUniversalIdentifier:
            targetField.universalIdentifier,
        },
      });
    },
  );

  it.each(['calendarEventTarget', 'messageThreadTarget'] as const)(
    'indexes each %s target relation for target-first timeline reads',
    (objectName) => {
      for (const indexName of [
        'personIdIndex',
        'companyIdIndex',
        'opportunityIdIndex',
      ] as const) {
        const { universalIdentifier } =
          STANDARD_OBJECTS[objectName].indexes[indexName];
        const indexMetadata =
          allFlatEntityMaps.flatIndexMaps.byUniversalIdentifier[
            universalIdentifier
          ];

        expect(indexMetadata).toMatchObject({
          isUnique: false,
          indexWhereClause: null,
        });
        expect(indexMetadata?.flatIndexFieldMetadatas).toHaveLength(1);
      }
    },
  );

  it.each(['calendarEventTarget', 'messageThreadTarget'] as const)(
    'uses one morph group for all %s target types',
    (objectName) => {
      const targetFields = [
        STANDARD_OBJECTS[objectName].fields.targetPerson,
        STANDARD_OBJECTS[objectName].fields.targetCompany,
        STANDARD_OBJECTS[objectName].fields.targetOpportunity,
      ].map(
        ({ universalIdentifier }) =>
          allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
            universalIdentifier
          ],
      );

      expect(targetFields).toHaveLength(3);
      expect(targetFields.every((field) => field?.isUIEditable === false)).toBe(
        true,
      );
      expect(new Set(targetFields.map((field) => field?.morphId))).toEqual(
        new Set([STANDARD_OBJECTS[objectName].morphIds.targetMorphId.morphId]),
      );
    },
  );

  it.each([
    {
      objectName: 'calendarEventTarget',
      indexes: [
        STANDARD_OBJECTS.calendarEventTarget.indexes
          .calendarEventPersonUniqueIndex,
        STANDARD_OBJECTS.calendarEventTarget.indexes
          .calendarEventCompanyUniqueIndex,
        STANDARD_OBJECTS.calendarEventTarget.indexes
          .calendarEventOpportunityUniqueIndex,
      ],
    },
    {
      objectName: 'messageThreadTarget',
      indexes: [
        STANDARD_OBJECTS.messageThreadTarget.indexes
          .messageThreadPersonUniqueIndex,
        STANDARD_OBJECTS.messageThreadTarget.indexes
          .messageThreadCompanyUniqueIndex,
        STANDARD_OBJECTS.messageThreadTarget.indexes
          .messageThreadOpportunityUniqueIndex,
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

        expect(indexMetadata).toMatchObject({
          isUnique: true,
        });
        expect(indexMetadata?.indexWhereClause).toBe('"deletedAt" IS NULL');
        expect(
          validateAndReturnIndexWhereClause(indexMetadata?.indexWhereClause),
        ).toBe('"deletedAt" IS NULL');
      }
    },
  );

  it.each(['calendarEventTarget', 'messageThreadTarget'] as const)(
    'defaults manual %s rows to manual provenance only',
    (objectName) => {
      const automaticField =
        allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS[objectName].fields.isAutomaticallyAssigned
            .universalIdentifier
        ];
      const manualField =
        allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS[objectName].fields.isManuallyAssigned
            .universalIdentifier
        ];

      expect(automaticField).toMatchObject({
        defaultValue: false,
        isUIEditable: false,
      });
      expect(manualField).toMatchObject({
        defaultValue: true,
        isUIEditable: false,
      });
    },
  );
});
