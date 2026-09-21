import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  MetadataWritability,
  RelationOnDeleteAction,
} from 'twenty-shared/types';

import { buildSystemRelationFlatFieldMetadatasForObject } from 'src/engine/metadata-modules/object-metadata/utils/build-system-relation-flat-field-metadatas-for-object.util';
import { ObjectSystemRelationsOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-system-relations-on-create-side-effect-handler.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-09-21T00:00:00.000Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  },
);
const objects = allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier;
const source = {
  ...objects[STANDARD_OBJECTS.company.universalIdentifier]!,
  universalIdentifier: '20202020-3333-4333-8333-333333333333',
  applicationUniversalIdentifier: '20202020-4444-4444-8444-444444444444',
  nameSingular: 'ticket',
  namePlural: 'tickets',
};
const build = (nameSingular = 'ticket') =>
  buildSystemRelationFlatFieldMetadatasForObject({
    sourceFlatObjectMetadata: { ...source, nameSingular },
    standardTargetFlatObjectMetadataByNameSingular: {
      agentChatThreadTarget:
        objects[STANDARD_OBJECTS.agentChatThreadTarget.universalIdentifier],
    },
    standardObjectNames: ['agentChatThreadTarget'],
    applicationUniversalIdentifier: source.applicationUniversalIdentifier,
  })[0];

describe('Agent chat thread custom relations', () => {
  it('creates private links with cascading record deletion and an index', () => {
    const {
      forwardFlatFieldMetadata,
      reverseFlatFieldMetadata,
      flatIndexMetadata,
    } = build();
    for (const field of [forwardFlatFieldMetadata, reverseFlatFieldMetadata]) {
      expect(field).toMatchObject({
        isSystemSideEffect: true,
        isUIEditable: false,
        isAuditLogged: false,
        writability: MetadataWritability.SYSTEM,
      });
    }
    expect(forwardFlatFieldMetadata.name).toBe('agentChatThreadTargets');
    expect(reverseFlatFieldMetadata).toMatchObject({
      name: 'targetTicket',
      type: FieldMetadataType.MORPH_RELATION,
      morphId:
        STANDARD_OBJECTS.agentChatThreadTarget.morphIds.targetMorphId.morphId,
      universalSettings: {
        joinColumnName: 'targetTicketId',
        onDelete: RelationOnDeleteAction.CASCADE,
      },
    });
    expect(
      flatIndexMetadata.universalFlatIndexFieldMetadatas[0]
        .fieldMetadataUniversalIdentifier,
    ).toBe(reverseFlatFieldMetadata.universalIdentifier);
  });

  it('preserves relation identifiers when a custom object is renamed', () => {
    expect(build('case').reverseFlatFieldMetadata.universalIdentifier).toBe(
      build().reverseFlatFieldMetadata.universalIdentifier,
    );
    expect(build('case').forwardFlatFieldMetadata.universalIdentifier).toBe(
      build().forwardFlatFieldMetadata.universalIdentifier,
    );
  });

  it.each([true, false])(
    'provisions a new custom object when the thread-target schema exists: %s',
    (hasThreadTargets) => {
      const maps = structuredClone(allFlatEntityMaps);
      if (!hasThreadTargets)
        delete maps.flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.agentChatThreadTarget.universalIdentifier
        ];
      const result =
        new ObjectSystemRelationsOnCreateSideEffectHandlerService().buildSideEffects(
          {
            flatEntity: source,
            relatedFlatEntityMaps: maps,
            allFlatEntityOperationRecordByMetadataName: {},
            context: {
              buildOptions: {
                isSystemBuild: false,
                applicationUniversalIdentifier:
                  source.applicationUniversalIdentifier,
              },
            },
          },
        );
      expect(result.status).toBe('success');
      if (result.status !== 'success')
        throw new Error('Expected successful provisioning');
      const fields = Object.values(
        result.operations.fieldMetadata?.flatEntityToCreate ?? {},
      );
      expect(
        fields.some((field) => field.name === 'agentChatThreadTargets'),
      ).toBe(hasThreadTargets);
      expect(fields.some((field) => field.name === 'noteTargets')).toBe(true);
    },
  );
});
