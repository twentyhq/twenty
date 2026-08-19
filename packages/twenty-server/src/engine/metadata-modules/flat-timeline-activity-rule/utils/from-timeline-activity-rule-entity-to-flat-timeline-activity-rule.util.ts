import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatTimelineActivityRule } from 'src/engine/metadata-modules/flat-timeline-activity-rule/types/flat-timeline-activity-rule.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromTimelineActivityRuleEntityToFlatTimelineActivityRule = (
  args: FromEntityToFlatEntityArgs<'timelineActivityRule'>,
): FlatTimelineActivityRule => {
  const { entity: timelineActivityRuleEntity } = args;

  const timelineActivityRuleScalarEntity = fromEntityToScalarEntity({
    metadataName: 'timelineActivityRule',
    entity: timelineActivityRuleEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'timelineActivityRule',
      ...args,
    });

  return {
    ...timelineActivityRuleScalarEntity,
    ...relationUniversalIdentifiers,
  };
};
