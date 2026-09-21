import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  MetadataReadability,
  MetadataWritability,
  RelationOnDeleteAction,
} from 'twenty-shared/types';

import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-09-21T00:00:00.000Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  },
);
const target = STANDARD_OBJECTS.agentChatThreadTarget;
const fields = allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier;

describe('Agent chat thread target metadata', () => {
  it('keeps associations private and out of audit logs', () => {
    expect(
      allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
        target.universalIdentifier
      ],
    ).toMatchObject({
      readability: MetadataReadability.SYSTEM,
      writability: MetadataWritability.SYSTEM,
      isAuditLogged: false,
      isSearchable: false,
    });
    for (const field of Object.values(target.fields)) {
      expect(fields[field.universalIdentifier]).toMatchObject({
        writability: MetadataWritability.SYSTEM,
        isAuditLogged: false,
        isUIEditable: false,
      });
    }
  });

  it('requires a thread and cascades permanent thread deletion', () => {
    expect(fields[target.fields.thread.universalIdentifier]).toMatchObject({
      isNullable: false,
      relationTargetObjectMetadataUniversalIdentifier:
        STANDARD_OBJECTS.agentChatThread.universalIdentifier,
      relationTargetFieldMetadataUniversalIdentifier:
        STANDARD_OBJECTS.agentChatThread.fields.targets.universalIdentifier,
      settings: {
        joinColumnName: 'threadId',
        onDelete: RelationOnDeleteAction.CASCADE,
      },
    });
  });

  it.each(['person', 'company', 'opportunity'] as const)(
    'links %s through a private morph relation with live uniqueness',
    (objectName) => {
      const fieldName = {
        person: 'targetPerson',
        company: 'targetCompany',
        opportunity: 'targetOpportunity',
      } as const;
      const indexName = {
        person: 'threadPersonUniqueIndex',
        company: 'threadCompanyUniqueIndex',
        opportunity: 'threadOpportunityUniqueIndex',
      } as const;
      const forward =
        fields[target.fields[fieldName[objectName]].universalIdentifier];
      const reverse =
        fields[
          STANDARD_OBJECTS[objectName].fields.agentChatThreadTargets
            .universalIdentifier
        ];
      expect(forward).toMatchObject({
        type: FieldMetadataType.MORPH_RELATION,
        morphId: target.morphIds.targetMorphId.morphId,
        relationTargetFieldMetadataUniversalIdentifier:
          reverse?.universalIdentifier,
        settings: { onDelete: RelationOnDeleteAction.CASCADE },
      });
      expect(reverse).toMatchObject({
        writability: MetadataWritability.SYSTEM,
        isUIEditable: false,
        isAuditLogged: false,
      });
      expect(
        allFlatEntityMaps.flatIndexMaps.byUniversalIdentifier[
          target.indexes[indexName[objectName]].universalIdentifier
        ],
      ).toMatchObject({
        isUnique: true,
        indexWhereClause: '"deletedAt" IS NULL',
        universalFlatIndexFieldMetadatas: expect.arrayContaining([
          expect.objectContaining({
            fieldMetadataUniversalIdentifier:
              target.fields.thread.universalIdentifier,
          }),
          expect.objectContaining({
            fieldMetadataUniversalIdentifier: forward?.universalIdentifier,
          }),
        ]),
      });
    },
  );
});
