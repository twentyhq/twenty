import { UniversalAllFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-all-flat-entity-maps.type';
import { UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { WorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';
import { fromUniversalFlatFieldMetadataToNakedFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/field/services/utils/from-universal-flat-field-metadata-to-naked-field-metadata.util';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';
import { v4 } from 'uuid';

export const fromUniversalFlatFieldMetadatasToNakedFieldMetadatas = ({
  allFlatEntityMaps,
  context,
  universalFlatFieldMetadatas,
}: {
  universalFlatFieldMetadatas: UniversalFlatFieldMetadata[];
  allFlatEntityMaps: UniversalAllFlatEntityMaps;
  context: Pick<
    WorkspaceMigrationActionRunnerArgs<WorkspaceMigrationAction>,
    'workspaceId' | 'flatApplication'
  >;
}) => {
  const allFieldIdToBeCreatedInActionByUniversalIdentifierMap = new Map<
    string,
    string
  >();

  for (const universalFlatFieldMetadata of universalFlatFieldMetadatas) {
    allFieldIdToBeCreatedInActionByUniversalIdentifierMap.set(
      universalFlatFieldMetadata.universalIdentifier,
      v4(),
    );
  }

  return universalFlatFieldMetadatas.map((universalFlatFieldMetadata) =>
    fromUniversalFlatFieldMetadataToNakedFieldMetadata({
      universalFlatFieldMetadata,
      allFieldIdToBeCreatedInActionByUniversalIdentifierMap,
      allFlatEntityMaps,
      context,
    }),
  );
};
