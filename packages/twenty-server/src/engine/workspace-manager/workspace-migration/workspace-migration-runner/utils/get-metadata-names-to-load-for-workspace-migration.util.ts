import { type AllMetadataName } from 'twenty-shared/metadata';

import { getMetadataRelatedMetadataNamesForValidation } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names-for-validation.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { getMetadataSerializedRelationNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-serialized-relation-names.util';

export const getMetadataNamesToLoadForWorkspaceMigration = (
  metadataNames: AllMetadataName[],
): AllMetadataName[] => [
  ...new Set([
    ...metadataNames,
    ...metadataNames.flatMap(getMetadataRelatedMetadataNames),
    ...metadataNames.flatMap(getMetadataSerializedRelationNames),
    ...metadataNames.flatMap(getMetadataRelatedMetadataNamesForValidation),
  ]),
];
