import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';

export const computeSearchVectorRebuildTargetUniversalIdentifiers = ({
  orchestratorActionsReport,
  fromFlatSearchFieldMetadataMaps,
  toFlatSearchFieldMetadataMaps,
  fromFlatFieldMetadataMaps,
}: {
  orchestratorActionsReport: OrchestratorActionsReport;
  fromFlatSearchFieldMetadataMaps?: MetadataUniversalFlatEntityMaps<'searchFieldMetadata'>;
  toFlatSearchFieldMetadataMaps?: MetadataUniversalFlatEntityMaps<'searchFieldMetadata'>;
  fromFlatFieldMetadataMaps?: MetadataUniversalFlatEntityMaps<'fieldMetadata'>;
}): Set<string> => {
  const searchFieldMetadataActions = orchestratorActionsReport.searchFieldMetadata;

  const candidateVectorUniversalIdentifiers = new Set<string>();

  for (const createAction of searchFieldMetadataActions.create) {
    const tsVectorFieldMetadataUniversalIdentifier =
      createAction.flatEntity.tsVectorFieldMetadataUniversalIdentifier;

    if (isDefined(tsVectorFieldMetadataUniversalIdentifier)) {
      candidateVectorUniversalIdentifiers.add(
        tsVectorFieldMetadataUniversalIdentifier,
      );
    }
  }

  for (const updateAction of searchFieldMetadataActions.update) {
    if (!isDefined(toFlatSearchFieldMetadataMaps)) {
      continue;
    }

    const flatSearchFieldMetadata = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: toFlatSearchFieldMetadataMaps,
      universalIdentifier: updateAction.universalIdentifier,
    });

    if (isDefined(flatSearchFieldMetadata?.tsVectorFieldMetadataUniversalIdentifier)) {
      candidateVectorUniversalIdentifiers.add(
        flatSearchFieldMetadata.tsVectorFieldMetadataUniversalIdentifier,
      );
    }
  }

  for (const deleteAction of searchFieldMetadataActions.delete) {
    if (!isDefined(fromFlatSearchFieldMetadataMaps)) {
      continue;
    }

    const flatSearchFieldMetadata = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: fromFlatSearchFieldMetadataMaps,
      universalIdentifier: deleteAction.universalIdentifier,
    });

    if (isDefined(flatSearchFieldMetadata?.tsVectorFieldMetadataUniversalIdentifier)) {
      candidateVectorUniversalIdentifiers.add(
        flatSearchFieldMetadata.tsVectorFieldMetadataUniversalIdentifier,
      );
    }
  }

  const renamedFieldUniversalIdentifiers = new Set(
    orchestratorActionsReport.fieldMetadata.update
      .filter((updateAction) => isDefined(updateAction.update.name))
      .map((updateAction) => updateAction.universalIdentifier),
  );

  if (renamedFieldUniversalIdentifiers.size > 0) {
    const allFlatSearchFieldMetadatas = Object.values(
      toFlatSearchFieldMetadataMaps?.byUniversalIdentifier ?? {},
    ).filter(isDefined);

    for (const flatSearchFieldMetadata of allFlatSearchFieldMetadatas) {
      if (
        renamedFieldUniversalIdentifiers.has(
          flatSearchFieldMetadata.fieldMetadataUniversalIdentifier,
        ) &&
        isDefined(
          flatSearchFieldMetadata.tsVectorFieldMetadataUniversalIdentifier,
        )
      ) {
        candidateVectorUniversalIdentifiers.add(
          flatSearchFieldMetadata.tsVectorFieldMetadataUniversalIdentifier,
        );
      }
    }
  }

  const rebuildTargetUniversalIdentifiers = new Set<string>();

  for (const vectorUniversalIdentifier of candidateVectorUniversalIdentifiers) {
    const vectorAlreadyExists = isDefined(
      findFlatEntityByUniversalIdentifier({
        flatEntityMaps:
          fromFlatFieldMetadataMaps ?? { byUniversalIdentifier: {} },
        universalIdentifier: vectorUniversalIdentifier,
      }),
    );

    if (vectorAlreadyExists) {
      rebuildTargetUniversalIdentifiers.add(vectorUniversalIdentifier);
    }
  }

  return rebuildTargetUniversalIdentifiers;
};
