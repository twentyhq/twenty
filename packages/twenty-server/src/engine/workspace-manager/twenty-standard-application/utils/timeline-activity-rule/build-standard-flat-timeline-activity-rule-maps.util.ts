import { getTimelineActivityRuleUniversalIdentifier } from 'twenty-shared/application';
import { v4 } from 'uuid';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { type FlatTimelineActivityRule } from 'src/engine/metadata-modules/flat-timeline-activity-rule/types/flat-timeline-activity-rule.type';
import { STANDARD_TIMELINE_ACTIVITY_RULES } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-timeline-activity-rules.constant';
import { type StandardBuilderArgs } from 'src/engine/workspace-manager/twenty-standard-application/types/metadata-standard-buillder-args.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export const buildStandardFlatTimelineActivityRuleMaps = ({
  now,
  workspaceId,
  twentyStandardApplicationId,
  standardObjectMetadataRelatedEntityIds,
  dependencyFlatEntityMaps: { flatObjectMetadataMaps },
}: StandardBuilderArgs<'timelineActivityRule'>): FlatEntityMaps<FlatTimelineActivityRule> => {
  let flatTimelineActivityRuleMaps = createEmptyFlatEntityMaps();

  for (const standardRule of STANDARD_TIMELINE_ACTIVITY_RULES) {
    const {
      objectName,
      relationFieldName,
      actions,
      triggerFieldNames,
      objectUniversalIdentifier,
      relationFieldUniversalIdentifier,
    } = standardRule;

    const flatObjectMetadata =
      findFlatEntityByUniversalIdentifierOrThrow<UniversalFlatObjectMetadata>({
        universalIdentifier: objectUniversalIdentifier,
        flatEntityMaps: flatObjectMetadataMaps,
      });

    const relatedEntityIds = standardObjectMetadataRelatedEntityIds[objectName];

    const flatTimelineActivityRule: FlatTimelineActivityRule = {
      id: v4(),
      universalIdentifier: getTimelineActivityRuleUniversalIdentifier({
        applicationUniversalIdentifier:
          flatObjectMetadata.applicationUniversalIdentifier,
        objectMetadataUniversalIdentifier: objectUniversalIdentifier,
        relationFieldMetadataUniversalIdentifier:
          relationFieldUniversalIdentifier,
      }),
      applicationId: twentyStandardApplicationId,
      applicationUniversalIdentifier:
        flatObjectMetadata.applicationUniversalIdentifier,
      objectMetadataId: relatedEntityIds.id,
      objectMetadataUniversalIdentifier: objectUniversalIdentifier,
      relationFieldMetadataId:
        relatedEntityIds.fields[
          relationFieldName as keyof typeof relatedEntityIds.fields
        ].id,
      relationFieldMetadataUniversalIdentifier:
        relationFieldUniversalIdentifier,
      resolution: 'MATERIALIZED',
      actions: [...actions],
      triggerFieldMetadataIds: triggerFieldNames.map(
        (triggerFieldName) =>
          relatedEntityIds.fields[
            triggerFieldName as keyof typeof relatedEntityIds.fields
          ].id,
      ),
      isActive: true,
      workspaceId,
      createdAt: now,
      updatedAt: now,
    };

    flatTimelineActivityRuleMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: flatTimelineActivityRule,
      flatEntityMaps: flatTimelineActivityRuleMaps,
    });
  }

  return flatTimelineActivityRuleMaps;
};
