import { msg, t } from '@lingui/core/macro';
import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { isMorphOrRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

const isCurrentWorkspaceMemberFilterableField = (
  fieldMetadata: UniversalFlatFieldMetadata,
): boolean => {
  if (fieldMetadata.type === FieldMetadataType.ACTOR) {
    return true;
  }

  if (!isMorphOrRelationUniversalFlatFieldMetadata(fieldMetadata)) {
    return false;
  }

  return (
    fieldMetadata.type === FieldMetadataType.RELATION &&
    fieldMetadata.universalSettings?.relationType ===
      RelationType.MANY_TO_ONE &&
    fieldMetadata.relationTargetObjectMetadataUniversalIdentifier ===
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember
  );
};

export const validateFlatViewMineFilterField = ({
  flatView,
  flatFieldMetadataMaps,
}: {
  flatView: UniversalFlatView;
  flatFieldMetadataMaps: AllUniversalFlatEntityMaps['flatFieldMetadataMaps'];
}): FlatEntityValidationError[] => {
  if (!isDefined(flatView.mineFilterFieldMetadataUniversalIdentifier)) {
    return [];
  }

  const mineFilterFieldMetadata = findFlatEntityByUniversalIdentifier({
    universalIdentifier: flatView.mineFilterFieldMetadataUniversalIdentifier,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(mineFilterFieldMetadata)) {
    return [
      {
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Mine filter field metadata not found`,
        userFriendlyMessage: msg`Mine filter field not found`,
      },
    ];
  }

  const errors: FlatEntityValidationError[] = [];

  if (
    mineFilterFieldMetadata.objectMetadataUniversalIdentifier !==
    flatView.objectMetadataUniversalIdentifier
  ) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Mine filter field must belong to the view object`,
      userFriendlyMessage: msg`Mine filter field must belong to the view object`,
    });
  }

  if (!isCurrentWorkspaceMemberFilterableField(mineFilterFieldMetadata)) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Mine filter field must be an actor or a many-to-one relation to workspace members`,
      userFriendlyMessage: msg`Mine filter field must be an actor or a workspace member relation field`,
    });
  }

  return errors;
};
