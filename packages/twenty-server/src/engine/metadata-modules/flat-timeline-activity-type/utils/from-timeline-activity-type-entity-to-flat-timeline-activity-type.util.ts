import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatTimelineActivityType } from 'src/engine/metadata-modules/flat-timeline-activity-type/types/flat-timeline-activity-type.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromTimelineActivityTypeEntityToFlatTimelineActivityType = (
  args: FromEntityToFlatEntityArgs<'timelineActivityType'>,
): FlatTimelineActivityType => {
  const { entity: timelineActivityTypeEntity } = args;

  const timelineActivityTypeScalarEntity = fromEntityToScalarEntity({
    metadataName: 'timelineActivityType',
    entity: timelineActivityTypeEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'timelineActivityType',
      ...args,
    });

  return {
    ...timelineActivityTypeScalarEntity,
    ...relationUniversalIdentifiers,
  };
};
