import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';

export const computeSearchVectorRebuildTargetUniversalIdentifiers = ({
  orchestratorActionsReport,
  fromFlatSearchFieldMetadataMaps,
  toFlatSearchFieldMetadataMaps,
  toFlatFieldMetadataMaps,
}: {
  orchestratorActionsReport: OrchestratorActionsReport;
  fromFlatSearchFieldMetadataMaps?: MetadataUniversalFlatEntityMaps<'searchFieldMetadata'>;
  toFlatSearchFieldMetadataMaps: MetadataUniversalFlatEntityMaps<'searchFieldMetadata'>;
  toFlatFieldMetadataMaps: MetadataUniversalFlatEntityMaps<'fieldMetadata'>;
}): Set<string> => {
  const searchFieldMetadataActions =
    orchestratorActionsReport.searchFieldMetadata;

  const emptyFlatSearchFieldMetadataMaps: MetadataUniversalFlatEntityMaps<'searchFieldMetadata'> =
    { byUniversalIdentifier: {} };

  const renamedFieldSearchFieldMetadataUniversalIdentifiers =
    orchestratorActionsReport.fieldMetadata.update
      .filter((updateAction) => isDefined(updateAction.update.name))
      .flatMap(
        (updateAction) =>
          findFlatEntityByUniversalIdentifier({
            flatEntityMaps: toFlatFieldMetadataMaps,
            universalIdentifier: updateAction.universalIdentifier,
          })?.searchFieldMetadataUniversalIdentifiers ?? [],
      );

  const candidateFieldMetadataVectorUniversalIdentifiers = new Set<string>(
    [
      ...searchFieldMetadataActions.create.map(
        (createAction) =>
          createAction.flatEntity.tsVectorFieldMetadataUniversalIdentifier,
      ),
      ...searchFieldMetadataActions.update.map(
        (updateAction) =>
          findFlatEntityByUniversalIdentifier({
            flatEntityMaps: toFlatSearchFieldMetadataMaps,
            universalIdentifier: updateAction.universalIdentifier,
          })?.tsVectorFieldMetadataUniversalIdentifier,
      ),
      ...searchFieldMetadataActions.delete.map(
        (deleteAction) =>
          findFlatEntityByUniversalIdentifier({
            flatEntityMaps:
              fromFlatSearchFieldMetadataMaps ??
              emptyFlatSearchFieldMetadataMaps,
            universalIdentifier: deleteAction.universalIdentifier,
          })?.tsVectorFieldMetadataUniversalIdentifier,
      ),
      ...renamedFieldSearchFieldMetadataUniversalIdentifiers.map(
        (searchFieldMetadataUniversalIdentifier) =>
          findFlatEntityByUniversalIdentifier({
            flatEntityMaps: toFlatSearchFieldMetadataMaps,
            universalIdentifier: searchFieldMetadataUniversalIdentifier,
          })?.tsVectorFieldMetadataUniversalIdentifier,
      ),
    ].filter(isDefined),
  );

  const fieldUniversalIdentifiersBeingCreatedOrDeleted = new Set<string>([
    ...orchestratorActionsReport.fieldMetadata.create.map(
      (createFieldAction) => createFieldAction.flatEntity.universalIdentifier,
    ),
    ...orchestratorActionsReport.objectMetadata.create.flatMap(
      (createObjectAction) =>
        createObjectAction.universalFlatFieldMetadatas.map(
          (universalFlatFieldMetadata) =>
            universalFlatFieldMetadata.universalIdentifier,
        ),
    ),
    ...orchestratorActionsReport.fieldMetadata.delete.map(
      (deleteFieldAction) => deleteFieldAction.universalIdentifier,
    ),
  ]);

  return new Set(
    [...candidateFieldMetadataVectorUniversalIdentifiers].filter(
      (vectorUniversalIdentifier) =>
        !fieldUniversalIdentifiersBeingCreatedOrDeleted.has(
          vectorUniversalIdentifier,
        ),
    ),
  );
};
