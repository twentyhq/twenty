import { isNonEmptyString } from '@sniptt/guards';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type WorkflowPickRecordAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const getPickRecordLoadBalanceConfigError = ({
  step,
  objectIdByNameSingular,
  flatFieldMetadataMaps,
}: {
  step: WorkflowPickRecordAction;
  objectIdByNameSingular: Record<string, string>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): string | undefined => {
  const input = step.settings?.input;

  if (!isDefined(input) || input.strategy !== 'LOAD_BALANCED') {
    return undefined;
  }

  const stepName = step.name ?? step.id;
  const loadBalance = input.loadBalance;

  if (
    !isNonEmptyString(loadBalance?.objectNameSingular) ||
    !isNonEmptyString(loadBalance?.fieldName)
  ) {
    return `Step "${stepName}" uses load balancing but is missing the object and field to count by.`;
  }

  const poolObjectId = objectIdByNameSingular[input.objectName];

  if (!isDefined(poolObjectId)) {
    return `Step "${stepName}" picks from object "${input.objectName}" which does not exist in this workspace.`;
  }

  const loadBalanceObjectId =
    objectIdByNameSingular[loadBalance.objectNameSingular];

  if (!isDefined(loadBalanceObjectId)) {
    return `Step "${stepName}" balances load by object "${loadBalance.objectNameSingular}" which does not exist in this workspace.`;
  }

  const countByField = Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .find(
      (field) =>
        field.objectMetadataId === loadBalanceObjectId &&
        field.name === loadBalance.fieldName,
    );

  const countsRelatedRecordsForPool =
    isDefined(countByField) &&
    isFlatFieldMetadataOfType(countByField, FieldMetadataType.RELATION) &&
    countByField.settings?.relationType === RelationType.MANY_TO_ONE &&
    countByField.relationTargetObjectMetadataId === poolObjectId;

  if (!countsRelatedRecordsForPool) {
    return `Step "${stepName}" must balance load by a many-to-one relation on "${loadBalance.objectNameSingular}" that points to "${input.objectName}".`;
  }

  return undefined;
};
