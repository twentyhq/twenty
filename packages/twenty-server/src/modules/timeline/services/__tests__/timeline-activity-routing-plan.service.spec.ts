import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { TimelineActivityRoutingPlanService } from 'src/modules/timeline/services/timeline-activity-routing-plan.service';

const WORKSPACE_ID = '00000000-0000-4000-8000-000000000001';
const APPLICATION_ID = '00000000-0000-4000-8000-000000000002';
const APPLICATION_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-000000000003';

type FlatEntityFixture = { id: string; universalIdentifier: string };

const buildFlatEntityMaps = <TEntity extends FlatEntityFixture>(
  flatEntities: TEntity[],
): FlatEntityMaps<never> =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      flatEntities.map((flatEntity) => [
        flatEntity.universalIdentifier,
        flatEntity,
      ]),
    ),
    universalIdentifierById: Object.fromEntries(
      flatEntities.map((flatEntity) => [
        flatEntity.id,
        flatEntity.universalIdentifier,
      ]),
    ),
    universalIdentifiersByApplicationId: {},
  }) as unknown as FlatEntityMaps<never>;

const NOTE_OBJECT = {
  id: 'note-object-id',
  universalIdentifier: 'note-object-universal-identifier',
  nameSingular: 'note',
  fieldIds: ['note-targets-field-id'],
  isAuditLogged: false,
  isSystem: false,
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
};

const NOTE_TARGET_OBJECT = {
  id: 'note-target-object-id',
  universalIdentifier: 'note-target-object-universal-identifier',
  nameSingular: 'noteTarget',
  fieldIds: ['note-target-note-field-id', 'note-target-person-field-id'],
  isAuditLogged: false,
  isSystem: false,
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
};

const PERSON_OBJECT = {
  id: 'person-object-id',
  universalIdentifier: 'person-object-universal-identifier',
  nameSingular: 'person',
  fieldIds: [],
  isAuditLogged: false,
  isSystem: false,
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
};

const NOTE_TARGETS_FIELD = {
  id: 'note-targets-field-id',
  universalIdentifier: 'note-targets-field-universal-identifier',
  name: 'noteTargets',
  type: FieldMetadataType.RELATION,
  objectMetadataId: NOTE_OBJECT.id,
  morphId: null,
  relationTargetObjectMetadataId: NOTE_TARGET_OBJECT.id,
  relationTargetFieldMetadataId: 'note-target-note-field-id',
  settings: {
    relationType: RelationType.ONE_TO_MANY,
    junctionTargetFieldId: 'note-target-person-field-id',
  },
};

const NOTE_TARGET_NOTE_FIELD = {
  id: 'note-target-note-field-id',
  universalIdentifier: 'note-target-note-field-universal-identifier',
  name: 'note',
  type: FieldMetadataType.RELATION,
  objectMetadataId: NOTE_TARGET_OBJECT.id,
  morphId: null,
  relationTargetObjectMetadataId: NOTE_OBJECT.id,
  relationTargetFieldMetadataId: NOTE_TARGETS_FIELD.id,
  settings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'noteId',
  },
};

const NOTE_TARGET_PERSON_FIELD = {
  id: 'note-target-person-field-id',
  universalIdentifier: 'note-target-person-field-universal-identifier',
  name: 'targetPerson',
  type: FieldMetadataType.RELATION,
  objectMetadataId: NOTE_TARGET_OBJECT.id,
  morphId: null,
  relationTargetObjectMetadataId: PERSON_OBJECT.id,
  relationTargetFieldMetadataId: 'person-note-targets-field-id',
  settings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'targetPersonId',
  },
};

const ROUTED_TIMELINE_ACTIVITY_TYPE = {
  id: 'timeline-activity-type-id',
  applicationId: APPLICATION_ID,
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  universalIdentifier: 'timeline-activity-type-universal-identifier',
  name: 'noteLinked',
  label: 'linked a note',
  action: 'linked' as const,
  icon: 'IconNotes',
  objectUniversalIdentifier: NOTE_OBJECT.universalIdentifier,
  targetRelationFieldUniversalIdentifier:
    NOTE_TARGETS_FIELD.universalIdentifier,
  triggerFieldUniversalIdentifiers: null,
  frontComponentUniversalIdentifier: null,
  replacesTimelineActivityTypeUniversalIdentifier: null,
  isActive: true,
  overrides: null,
};

const buildCacheResult = ({
  isActive = true,
  typeHash = 'type-hash',
}: {
  isActive?: boolean;
  typeHash?: string;
} = {}) => ({
  data: {
    flatObjectMetadataMaps: buildFlatEntityMaps([
      NOTE_OBJECT,
      NOTE_TARGET_OBJECT,
      PERSON_OBJECT,
    ]) as unknown as FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: buildFlatEntityMaps([
      NOTE_TARGETS_FIELD,
      NOTE_TARGET_NOTE_FIELD,
      NOTE_TARGET_PERSON_FIELD,
    ]) as unknown as FlatEntityMaps<FlatFieldMetadata>,
    flatTimelineActivityTypeMaps: {
      byUniversalIdentifier: {
        [ROUTED_TIMELINE_ACTIVITY_TYPE.universalIdentifier]: {
          ...ROUTED_TIMELINE_ACTIVITY_TYPE,
          isActive,
        },
      },
      universalIdentifierById: {
        [ROUTED_TIMELINE_ACTIVITY_TYPE.id]:
          ROUTED_TIMELINE_ACTIVITY_TYPE.universalIdentifier,
      },
      universalIdentifiersByApplicationId: {},
    },
  },
  hashes: {
    flatObjectMetadataMaps: 'object-hash',
    flatFieldMetadataMaps: 'field-hash',
    flatTimelineActivityTypeMaps: typeHash,
  },
});

const buildService = () => {
  const getOrRecomputeManyOrAllFlatEntityMapsWithHashes = jest
    .fn()
    .mockResolvedValue(buildCacheResult());
  const reportAll = jest.fn();
  const service = new TimelineActivityRoutingPlanService(
    { getOrRecomputeManyOrAllFlatEntityMapsWithHashes } as never,
    { reportAll } as never,
  );

  return {
    getOrRecomputeManyOrAllFlatEntityMapsWithHashes,
    reportAll,
    service,
  };
};

describe('TimelineActivityRoutingPlanService', () => {
  it('keeps audit-logged objects without resolving a routing plan', async () => {
    const { getOrRecomputeManyOrAllFlatEntityMapsWithHashes, service } =
      buildService();

    await expect(
      service.shouldProcessEvent({
        flatObjectMetadata: { isAuditLogged: true } as never,
        workspaceId: WORKSPACE_ID,
      }),
    ).resolves.toBe(true);
    expect(
      getOrRecomputeManyOrAllFlatEntityMapsWithHashes,
    ).not.toHaveBeenCalled();
  });

  it('shares one declared route between source and junction event paths', async () => {
    const { service } = buildService();

    await expect(
      service.shouldProcessEvent({
        flatObjectMetadata: NOTE_OBJECT as never,
        workspaceId: WORKSPACE_ID,
      }),
    ).resolves.toBe(true);
    await expect(
      service.shouldProcessEvent({
        flatObjectMetadata: NOTE_TARGET_OBJECT as never,
        workspaceId: WORKSPACE_ID,
      }),
    ).resolves.toBe(true);
    await expect(
      service.shouldProcessEvent({
        flatObjectMetadata: PERSON_OBJECT as never,
        workspaceId: WORKSPACE_ID,
      }),
    ).resolves.toBe(false);

    await expect(
      service.getRulesForEventBatch({
        flatObjectMetadata: NOTE_OBJECT as never,
        workspaceId: WORKSPACE_ID,
      }),
    ).resolves.toMatchObject({
      sourceRules: [{ targetShape: { kind: 'JUNCTION' } }],
      junctionRules: [],
    });
    await expect(
      service.getRulesForEventBatch({
        flatObjectMetadata: NOTE_TARGET_OBJECT as never,
        workspaceId: WORKSPACE_ID,
      }),
    ).resolves.toMatchObject({
      sourceRules: [],
      junctionRules: [{ targetShape: { kind: 'JUNCTION' } }],
    });
  });

  it('reuses a routing plan while all metadata hashes are unchanged', async () => {
    const { reportAll, service } = buildService();

    await service.shouldProcessEvent({
      flatObjectMetadata: NOTE_OBJECT as never,
      workspaceId: WORKSPACE_ID,
    });
    await service.shouldProcessEvent({
      flatObjectMetadata: NOTE_TARGET_OBJECT as never,
      workspaceId: WORKSPACE_ID,
    });

    expect(reportAll).toHaveBeenCalledTimes(4);
  });

  it('rebuilds eligibility when timeline type metadata changes', async () => {
    const {
      getOrRecomputeManyOrAllFlatEntityMapsWithHashes,
      reportAll,
      service,
    } = buildService();

    getOrRecomputeManyOrAllFlatEntityMapsWithHashes
      .mockResolvedValueOnce(buildCacheResult())
      .mockResolvedValueOnce(
        buildCacheResult({ isActive: false, typeHash: 'inactive-type-hash' }),
      );

    await expect(
      service.shouldProcessEvent({
        flatObjectMetadata: NOTE_OBJECT as never,
        workspaceId: WORKSPACE_ID,
      }),
    ).resolves.toBe(true);
    await expect(
      service.shouldProcessEvent({
        flatObjectMetadata: NOTE_OBJECT as never,
        workspaceId: WORKSPACE_ID,
      }),
    ).resolves.toBe(false);
    expect(reportAll).toHaveBeenCalledTimes(8);
  });
});
