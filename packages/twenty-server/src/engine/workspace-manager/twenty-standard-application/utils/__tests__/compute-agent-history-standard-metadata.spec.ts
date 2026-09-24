import { validateAndReturnIndexWhereClause } from 'src/engine/workspace-manager/workspace-migration/utils/validate-index-where-clause.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { isDefined } from 'twenty-shared/utils';
import { validateMorphOrRelationFlatFieldOnDelete } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-morph-or-relation-flat-field-on-delete.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  MetadataReadability,
  MetadataWritability,
} from 'twenty-shared/types';

import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const OBJECT_NAMES = [
  'agentChatThread',
  'agentChatThreadTarget',
  'agentMessage',
  'agentMessagePart',
  'agentTurn',
  'agentTurnEvaluation',
] as const;

const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-09-20T00:00:00.000Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  },
);

describe('agent history workspace metadata', () => {
  it.each(OBJECT_NAMES)(
    'materializes exactly the declared fields for %s',
    (name) => {
      const fields = Object.values(
        allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
      )
        .filter(isDefined)
        .filter(
          (field) =>
            field.objectMetadataUniversalIdentifier ===
            STANDARD_OBJECTS[name].universalIdentifier,
        );
      expect(fields.map((field) => field.name).sort()).toEqual(
        Object.keys(STANDARD_OBJECTS[name].fields).sort(),
      );
    },
  );

  it('uses index predicates accepted by the workspace schema manager', () => {
    for (const index of Object.values(
      allFlatEntityMaps.flatIndexMaps.byUniversalIdentifier,
    ).filter(isDefined)) {
      expect(() =>
        validateAndReturnIndexWhereClause(index.indexWhereClause),
      ).not.toThrow();
    }
  });
  it('passes relation delete-action validation', () => {
    const historyObjectIds: string[] = OBJECT_NAMES.map(
      (name) => STANDARD_OBJECTS[name].universalIdentifier,
    );
    for (const field of Object.values(
      allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
    ).filter(isDefined)) {
      if (
        !isMorphOrRelationFlatFieldMetadata(field) ||
        !historyObjectIds.includes(field.objectMetadataUniversalIdentifier)
      )
        continue;
      expect(
        validateMorphOrRelationFlatFieldOnDelete({
          universalFlatFieldMetadata: {
            ...field,
            universalSettings: field.settings,
          },
        }),
      ).toEqual([]);
    }
  });

  it.each(['agentMessage', 'agentTurn'] as const)(
    'indexes %s by agent',
    (name) => {
      expect(
        allFlatEntityMaps.flatIndexMaps.byUniversalIdentifier[
          STANDARD_OBJECTS[name].indexes.agentIndex.universalIdentifier
        ],
      ).toMatchObject({ isUnique: false });
    },
  );
  it.each(OBJECT_NAMES)('keeps %s protected by metadata policy', (name) => {
    expect(
      allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS[name].universalIdentifier
      ],
    ).toMatchObject({
      nameSingular: name,
      isSystem: true,
      isSearchable: false,
      isAuditLogged: false,
      isUICreatable: false,
      isUIEditable: false,
      readability:
        name === 'agentChatThread'
          ? MetadataReadability.PRIVATE
          : MetadataReadability.SYSTEM,
      writability:
        name === 'agentChatThread'
          ? MetadataWritability.OPEN
          : MetadataWritability.SYSTEM,
    });
  });

  it('retains exact precision for credits and cache token counts', () => {
    for (const name of [
      'totalInputCredits',
      'totalOutputCredits',
      'totalCacheReadTokens',
      'totalCacheCreationTokens',
    ] as const) {
      expect(
        allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.agentChatThread.fields[name].universalIdentifier
        ],
      ).toMatchObject({ type: FieldMetadataType.NUMERIC, defaultValue: "'0'" });
    }
  });

  it('retains one hidden kickoff message per thread', () => {
    expect(
      allFlatEntityMaps.flatIndexMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentMessage.indexes.hiddenKickoffIndex
          .universalIdentifier
      ],
    ).toMatchObject({
      isUnique: true,
      indexWhereClause: '"isHidden" = true AND "deletedAt" IS NULL',
    });
  });
});
