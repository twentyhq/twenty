import { type MetadataTechnicalNamesByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/types/metadata-technical-names-by-universal-identifier.type';
import { projectMetadataTechnicalNames } from 'src/engine/metadata-modules/flat-entity/utils/project-metadata-technical-names.util';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { type TwentyStandardAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/types/twenty-standard-all-flat-entity-maps.type';
import { applyStandardFieldJoinColumnNames } from 'src/engine/workspace-manager/twenty-standard-application/utils/apply-standard-field-join-column-names.util';

export const applyStandardMetadataTechnicalNamesOrThrow = ({
  allFlatEntityMaps,
  technicalNamesByUniversalIdentifier,
}: {
  allFlatEntityMaps: TwentyStandardAllFlatEntityMaps;
  technicalNamesByUniversalIdentifier: MetadataTechnicalNamesByUniversalIdentifier;
}): TwentyStandardAllFlatEntityMaps => {
  for (const universalIdentifier of Object.keys(
    technicalNamesByUniversalIdentifier.objects,
  )) {
    findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatObjectMetadataMaps,
      universalIdentifier,
    });
  }

  for (const universalIdentifier of Object.keys(
    technicalNamesByUniversalIdentifier.fields,
  )) {
    findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatFieldMetadataMaps,
      universalIdentifier,
    });
  }

  const projectedMetadata = projectMetadataTechnicalNames({
    metadata: allFlatEntityMaps,
    technicalNamesByUniversalIdentifier,
  });

  return {
    ...allFlatEntityMaps,
    ...projectedMetadata,
    flatFieldMetadataMaps: applyStandardFieldJoinColumnNames({
      flatFieldMetadataMaps: projectedMetadata.flatFieldMetadataMaps,
      technicalNamesByUniversalIdentifier,
    }),
  };
};
