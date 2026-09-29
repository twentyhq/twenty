import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityOperationRecord } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type FlatFieldMetadataMaps } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-maps.type';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-maps.type';

export const getWorkflowVersionReferenceApplicationIds = ({
  workflowVersionOperations,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  workflowVersionOperations:
    | FlatEntityOperationRecord<'workflowVersion'>
    | undefined;
  flatObjectMetadataMaps: FlatObjectMetadataMaps | undefined;
  flatFieldMetadataMaps: FlatFieldMetadataMaps | undefined;
}): string[] => {
  if (
    !isDefined(workflowVersionOperations) ||
    !isDefined(flatObjectMetadataMaps) ||
    !isDefined(flatFieldMetadataMaps)
  ) {
    return [];
  }
  const objectNames = new Set<string>();
  for (const version of [
    ...Object.values(workflowVersionOperations.flatEntityToCreate),
    ...Object.values(workflowVersionOperations.flatEntityToUpdate),
  ]) {
    if (!isDefined(version) || !version.isSystemSideEffect) {
      continue;
    }
    for (const step of version.steps ?? []) {
      if (
        step.type === 'CREATE_RECORD' ||
        step.type === 'UPDATE_RECORD' ||
        step.type === 'UPSERT_RECORD'
      ) {
        objectNames.add(step.settings.input.objectName);
      }
    }
  }

  if (objectNames.size === 0) {
    return [];
  }

  const applicationIds = new Set<string>();
  const objectIdentifiers = new Set<string>();
  for (const object of Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    if (objectNames.has(object.nameSingular)) {
      applicationIds.add(object.applicationId);
      objectIdentifiers.add(object.universalIdentifier);
    }
  }
  for (const field of Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    if (!objectIdentifiers.has(field.objectMetadataUniversalIdentifier)) {
      continue;
    }
    applicationIds.add(field.applicationId);
    const target = isDefined(
      field.relationTargetObjectMetadataUniversalIdentifier,
    )
      ? flatObjectMetadataMaps.byUniversalIdentifier[
          field.relationTargetObjectMetadataUniversalIdentifier
        ]
      : undefined;
    if (isDefined(target)) {
      applicationIds.add(target.applicationId);
    }
  }
  return [...applicationIds];
};
