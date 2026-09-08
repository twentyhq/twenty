import { isDefined } from 'twenty-shared/utils';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { isFlatFieldMetadataAuditLogged } from 'src/modules/timeline/utils/is-flat-field-metadata-audit-logged.util';

export const buildNonAuditLoggedFieldNamesByObjectMetadataId = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): Map<string, Set<string>> => {
  const nonAuditLoggedFieldNamesByObjectMetadataId = new Map<
    string,
    Set<string>
  >();

  for (const flatObjectMetadata of Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  )) {
    if (!isDefined(flatObjectMetadata)) {
      continue;
    }

    const nonAuditLoggedFieldNames = new Set(
      getFlatFieldsFromFlatObjectMetadata(
        flatObjectMetadata,
        flatFieldMetadataMaps,
      )
        .filter(
          (flatFieldMetadata) =>
            !isFlatFieldMetadataAuditLogged(flatFieldMetadata),
        )
        .map(({ name }) => name),
    );

    if (nonAuditLoggedFieldNames.size > 0) {
      nonAuditLoggedFieldNamesByObjectMetadataId.set(
        flatObjectMetadata.id,
        nonAuditLoggedFieldNames,
      );
    }
  }

  return nonAuditLoggedFieldNamesByObjectMetadataId;
};
