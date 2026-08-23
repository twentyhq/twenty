import { TimelineActivityEventEligibilityService } from 'src/modules/timeline/services/timeline-activity-event-eligibility.service';

const SOURCE_OBJECT_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-000000000001';
const JUNCTION_OBJECT_ID = '00000000-0000-4000-8000-000000000002';
const RELATION_FIELD_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-000000000003';

const buildService = ({
  objectUniversalIdentifier,
  relationTargetObjectMetadataId,
}: {
  objectUniversalIdentifier: string;
  relationTargetObjectMetadataId?: string;
}) => {
  const getOrRecomputeManyOrAllFlatEntityMaps = jest.fn().mockResolvedValue({
    flatFieldMetadataMaps: {
      byUniversalIdentifier: {
        [RELATION_FIELD_UNIVERSAL_IDENTIFIER]: {
          relationTargetObjectMetadataId,
        },
      },
    },
    flatTimelineActivityTypeMaps: {
      byUniversalIdentifier: {
        type: {
          action: 'linked',
          applicationUniversalIdentifier:
            '00000000-0000-4000-8000-000000000004',
          isActive: true,
          objectUniversalIdentifier,
          targetRelationFieldUniversalIdentifier:
            RELATION_FIELD_UNIVERSAL_IDENTIFIER,
          triggerFieldUniversalIdentifiers: null,
          universalIdentifier: '00000000-0000-4000-8000-000000000005',
        },
      },
    },
  });

  return {
    getOrRecomputeManyOrAllFlatEntityMaps,
    service: new TimelineActivityEventEligibilityService({
      getOrRecomputeManyOrAllFlatEntityMaps,
    } as never),
  };
};

describe('TimelineActivityEventEligibilityService', () => {
  it('keeps audit-logged objects on the timeline write path', async () => {
    const { getOrRecomputeManyOrAllFlatEntityMaps, service } = buildService({
      objectUniversalIdentifier: SOURCE_OBJECT_UNIVERSAL_IDENTIFIER,
    });

    await expect(
      service.shouldProcessEvent({
        flatObjectMetadata: { isAuditLogged: true } as never,
        workspaceId: 'workspace-id',
      }),
    ).resolves.toBe(true);
    expect(getOrRecomputeManyOrAllFlatEntityMaps).not.toHaveBeenCalled();
  });

  it('keeps non-audited declared source and junction objects', async () => {
    const { service } = buildService({
      objectUniversalIdentifier: SOURCE_OBJECT_UNIVERSAL_IDENTIFIER,
      relationTargetObjectMetadataId: JUNCTION_OBJECT_ID,
    });

    await expect(
      service.shouldProcessEvent({
        flatObjectMetadata: {
          id: 'source-object-id',
          isAuditLogged: false,
          universalIdentifier: SOURCE_OBJECT_UNIVERSAL_IDENTIFIER,
        } as never,
        workspaceId: 'workspace-id',
      }),
    ).resolves.toBe(true);
    await expect(
      service.shouldProcessEvent({
        flatObjectMetadata: {
          id: JUNCTION_OBJECT_ID,
          isAuditLogged: false,
          universalIdentifier: 'junction-object-universal-identifier',
        } as never,
        workspaceId: 'workspace-id',
      }),
    ).resolves.toBe(true);
  });

  it('drops unrelated non-audited hot-path objects before enqueueing', async () => {
    const { service } = buildService({
      objectUniversalIdentifier: SOURCE_OBJECT_UNIVERSAL_IDENTIFIER,
      relationTargetObjectMetadataId: JUNCTION_OBJECT_ID,
    });

    await expect(
      service.shouldProcessEvent({
        flatObjectMetadata: {
          id: 'unrelated-object-id',
          isAuditLogged: false,
          universalIdentifier: 'unrelated-object-universal-identifier',
        } as never,
        workspaceId: 'workspace-id',
      }),
    ).resolves.toBe(false);
  });
});
