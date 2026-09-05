import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadataValidationError } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-validation-error.type';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

const isRelationUniversalFlatFieldMetadata = (
  universalFlatFieldMetadata: UniversalFlatFieldMetadata,
): universalFlatFieldMetadata is UniversalFlatFieldMetadata<FieldMetadataType.RELATION> =>
  universalFlatFieldMetadata.type === FieldMetadataType.RELATION;

const buildOwnerFieldError = (
  reason: string,
  userFriendlyMessage: FlatObjectMetadataValidationError['userFriendlyMessage'],
): FlatObjectMetadataValidationError => ({
  code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
  message: `ownerFieldMetadataUniversalIdentifier validation failed: ${reason}`,
  userFriendlyMessage,
});

export const validateFlatObjectMetadataOwnerField = ({
  universalFlatObjectMetadata,
  universalFlatFieldMetadataMaps,
}: {
  universalFlatObjectMetadata: Pick<
    UniversalFlatObjectMetadata,
    'universalIdentifier' | 'ownerFieldMetadataUniversalIdentifier'
  >;
  universalFlatFieldMetadataMaps: UniversalFlatEntityMaps<UniversalFlatFieldMetadata>;
}): FlatObjectMetadataValidationError[] => {
  const { ownerFieldMetadataUniversalIdentifier } = universalFlatObjectMetadata;

  if (!isDefined(ownerFieldMetadataUniversalIdentifier)) {
    return [];
  }

  const ownerFlatFieldMetadata = findFlatEntityByUniversalIdentifier({
    universalIdentifier: ownerFieldMetadataUniversalIdentifier,
    flatEntityMaps: universalFlatFieldMetadataMaps,
  });

  if (!isDefined(ownerFlatFieldMetadata)) {
    return [
      buildOwnerFieldError(
        'related field metadata not found',
        msg`Field declared as owner field not found`,
      ),
    ];
  }

  if (
    ownerFlatFieldMetadata.objectMetadataUniversalIdentifier !==
    universalFlatObjectMetadata.universalIdentifier
  ) {
    return [
      buildOwnerFieldError(
        'field belongs to another object',
        msg`Owner field must belong to the object`,
      ),
    ];
  }

  if (
    !isRelationUniversalFlatFieldMetadata(ownerFlatFieldMetadata) ||
    ownerFlatFieldMetadata.universalSettings?.relationType !==
      RelationType.MANY_TO_ONE
  ) {
    return [
      buildOwnerFieldError(
        'field is not a MANY_TO_ONE relation',
        msg`Owner field must be a many-to-one relation to workspace members`,
      ),
    ];
  }

  if (
    ownerFlatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier !==
    STANDARD_OBJECTS.workspaceMember.universalIdentifier
  ) {
    return [
      buildOwnerFieldError(
        'field does not target workspaceMember',
        msg`Owner field must be a relation to workspace members`,
      ),
    ];
  }

  return [];
};
