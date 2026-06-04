import { isTwentyStandardApplicationUniversalIdentifier } from 'src/engine/metadata-modules/utils/is-twenty-standard-application-universal-identifier.util';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

import { computeTableName } from './compute-table-name.util';

export const computeObjectTargetTable = (
  objectMetadata: Pick<
    UniversalFlatObjectMetadata,
    'nameSingular' | 'applicationUniversalIdentifier'
  >,
) => {
  return computeTableName(
    objectMetadata.nameSingular,
    !isTwentyStandardApplicationUniversalIdentifier(
      objectMetadata.applicationUniversalIdentifier,
    ),
  );
};
