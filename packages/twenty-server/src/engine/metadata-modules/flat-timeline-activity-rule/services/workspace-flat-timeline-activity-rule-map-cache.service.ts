import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatTimelineActivityRuleMaps } from 'src/engine/metadata-modules/flat-timeline-activity-rule/types/flat-timeline-activity-rule-maps.type';
import { fromTimelineActivityRuleEntityToFlatTimelineActivityRule } from 'src/engine/metadata-modules/flat-timeline-activity-rule/utils/from-timeline-activity-rule-entity-to-flat-timeline-activity-rule.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TimelineActivityRuleEntity } from 'src/engine/metadata-modules/timeline-activity-rule/entities/timeline-activity-rule.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatTimelineActivityRuleMaps', { packingPonderation: 1 })
export class WorkspaceFlatTimelineActivityRuleMapCacheService extends WorkspaceCacheProvider<FlatTimelineActivityRuleMaps> {
  constructor(
    @InjectWorkspaceScopedRepository(TimelineActivityRuleEntity)
    private readonly timelineActivityRuleRepository: WorkspaceScopedRepository<TimelineActivityRuleEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<FlatTimelineActivityRuleMaps> {
    const [
      timelineActivityRules,
      applications,
      objectMetadatas,
      fieldMetadatas,
    ] = await Promise.all([
      this.timelineActivityRuleRepository.find(workspaceId),
      this.applicationRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier'],
        withDeleted: true,
      }),
      this.objectMetadataRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier'],
        withDeleted: true,
      }),
      this.fieldMetadataRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier'],
        withDeleted: true,
      }),
    ]);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const objectMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(objectMetadatas);
    const fieldMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(fieldMetadatas);

    const flatTimelineActivityRuleMaps = createEmptyFlatEntityMaps();

    for (const timelineActivityRule of timelineActivityRules) {
      const flatTimelineActivityRule =
        fromTimelineActivityRuleEntityToFlatTimelineActivityRule({
          entity: timelineActivityRule,
          applicationIdToUniversalIdentifierMap,
          objectMetadataIdToUniversalIdentifierMap,
          fieldMetadataIdToUniversalIdentifierMap,
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatTimelineActivityRule,
        flatEntityMapsToMutate: flatTimelineActivityRuleMaps,
      });
    }

    return flatTimelineActivityRuleMaps;
  }
}
