import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';

export const computeSearchVectorRebuildTargetUniversalIdentifiers = ({
  orchestratorActionsReport,
  fromFlatSearchFieldMetadataMaps,
  toFlatSearchFieldMetadataMaps,
}: {
  orchestratorActionsReport: OrchestratorActionsReport;
  fromFlatSearchFieldMetadataMaps?: MetadataUniversalFlatEntityMaps<'searchFieldMetadata'>;
  toFlatSearchFieldMetadataMaps?: MetadataUniversalFlatEntityMaps<'searchFieldMetadata'>;
}): Set<string> => {
  const searchFieldMetadataActions =
    orchestratorActionsReport.searchFieldMetadata;

  const renamedFieldUniversalIdentifiers = new Set(
    orchestratorActionsReport.fieldMetadata.update
      .filter((updateAction) => isDefined(updateAction.update.name))
      .map((updateAction) => updateAction.universalIdentifier),
  );

  const emptyFlatSearchFieldMetadataMaps: MetadataUniversalFlatEntityMaps<'searchFieldMetadata'> =
    { byUniversalIdentifier: {} };

  const candidateFieldMetadataVectorUniversalIdentifiers = new Set<string>(
    [
      // Created search fields carry their target vector directly on the action.
      ...searchFieldMetadataActions.create.map(
        (createAction) =>
          createAction.flatEntity.tsVectorFieldMetadataUniversalIdentifier,
      ),
      // Updated search fields are resolved from the post-migration maps.
      ...searchFieldMetadataActions.update.map(
        (updateAction) =>
          findFlatEntityByUniversalIdentifier({
            flatEntityMaps:
              toFlatSearchFieldMetadataMaps ?? emptyFlatSearchFieldMetadataMaps,
            universalIdentifier: updateAction.universalIdentifier,
          })?.tsVectorFieldMetadataUniversalIdentifier,
      ),
      // Deleted search fields are resolved from the pre-migration maps.
      ...searchFieldMetadataActions.delete.map(
        (deleteAction) =>
          findFlatEntityByUniversalIdentifier({
            flatEntityMaps:
              fromFlatSearchFieldMetadataMaps ??
              emptyFlatSearchFieldMetadataMaps,
            universalIdentifier: deleteAction.universalIdentifier,
          })?.tsVectorFieldMetadataUniversalIdentifier,
      ),
      // Renaming an indexed field must refresh every vector that references it.
      ...Object.values(
        toFlatSearchFieldMetadataMaps?.byUniversalIdentifier ?? {},
      )
        .filter(isDefined)
        .filter((flatSearchFieldMetadata) =>
          renamedFieldUniversalIdentifiers.has(
            flatSearchFieldMetadata.fieldMetadataUniversalIdentifier,
          ),
        )
        .map(
          (flatSearchFieldMetadata) =>
            flatSearchFieldMetadata.tsVectorFieldMetadataUniversalIdentifier,
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
