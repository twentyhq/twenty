/* @license Enterprise */

import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatRelatedRecordPath } from 'src/engine/metadata-modules/flat-related-record-path/types/flat-related-record-path.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromRelatedRecordPathEntityToFlatRelatedRecordPath = (
  args: FromEntityToFlatEntityArgs<'relatedRecordPath'>,
): FlatRelatedRecordPath => {
  const { entity: relatedRecordPathEntity } = args;

  const relatedRecordPathScalarEntity = fromEntityToScalarEntity({
    metadataName: 'relatedRecordPath',
    entity: relatedRecordPathEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'relatedRecordPath',
      ...args,
    });

  return {
    ...relatedRecordPathScalarEntity,
    ...relationUniversalIdentifiers,
  };
};
