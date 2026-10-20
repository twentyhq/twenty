/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { type ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { PermissionsExceptionCode } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

type RelationFieldShape = {
  type: FieldMetadataType;
  settings?: { relationType?: string } | null;
  objectMetadataUniversalIdentifier: string;
  relationTargetObjectMetadataUniversalIdentifier?: string | null;
};

const isRelationFieldOf = ({
  field,
  objectUniversalIdentifier,
  relationType,
  targetObjectUniversalIdentifier,
}: {
  field: RelationFieldShape | undefined;
  objectUniversalIdentifier: string;
  relationType: RelationType;
  targetObjectUniversalIdentifier?: string;
}) =>
  isDefined(field) &&
  (field.type === FieldMetadataType.RELATION ||
    field.type === FieldMetadataType.MORPH_RELATION) &&
  field.objectMetadataUniversalIdentifier === objectUniversalIdentifier &&
  field.settings?.relationType === relationType &&
  (!isDefined(targetObjectUniversalIdentifier) ||
    field.relationTargetObjectMetadataUniversalIdentifier ===
      targetObjectUniversalIdentifier);

const isJunctionPathOf = ({
  field,
  junctionField,
  objectUniversalIdentifier,
  parentObjectUniversalIdentifier,
}: {
  field: RelationFieldShape | undefined;
  junctionField: RelationFieldShape | undefined;
  objectUniversalIdentifier: string;
  parentObjectUniversalIdentifier: string;
}) => {
  const junctionObjectUniversalIdentifier =
    field?.relationTargetObjectMetadataUniversalIdentifier;

  return (
    isDefined(junctionObjectUniversalIdentifier) &&
    isRelationFieldOf({
      field,
      objectUniversalIdentifier,
      relationType: RelationType.ONE_TO_MANY,
    }) &&
    isRelationFieldOf({
      field: junctionField,
      objectUniversalIdentifier: junctionObjectUniversalIdentifier,
      relationType: RelationType.MANY_TO_ONE,
      targetObjectUniversalIdentifier: parentObjectUniversalIdentifier,
    })
  );
};

@Injectable()
export class FlatRecordInheritanceRuleValidatorService {
  validateFlatRecordInheritanceRuleCreation({
    flatEntityToValidate: rule,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatRecordInheritanceRuleMaps,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.recordInheritanceRule
  >): FailedFlatEntityValidation<'recordInheritanceRule', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: rule.universalIdentifier,
      },
      metadataName: 'recordInheritanceRule',
      type: 'create',
    });

    const invalidRule = (message: string) =>
      validationResult.errors.push({
        code: PermissionsExceptionCode.INVALID_SETTING,
        message,
        userFriendlyMessage: msg`This related records rule is not valid.`,
      });

    const childObject = findFlatEntityByUniversalIdentifier({
      universalIdentifier: rule.objectMetadataUniversalIdentifier,
      flatEntityMaps: flatObjectMetadataMaps,
    });
    const parentObject = findFlatEntityByUniversalIdentifier({
      universalIdentifier: rule.parentObjectMetadataUniversalIdentifier,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(childObject) || !isDefined(parentObject)) {
      invalidRule(t`Record inheritance rule object not found`);

      return validationResult;
    }

    if (childObject.isSystem) {
      invalidRule(t`System objects cannot follow another object`);
    }

    const field = findFlatEntityByUniversalIdentifier({
      universalIdentifier: rule.fieldMetadataUniversalIdentifier,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    const junctionField = isDefined(
      rule.junctionFieldMetadataUniversalIdentifier,
    )
      ? findFlatEntityByUniversalIdentifier({
          universalIdentifier: rule.junctionFieldMetadataUniversalIdentifier,
          flatEntityMaps: flatFieldMetadataMaps,
        })
      : undefined;

    if (
      !isDefined(rule.junctionFieldMetadataUniversalIdentifier) &&
      !isRelationFieldOf({
        field,
        objectUniversalIdentifier: childObject.universalIdentifier,
        relationType: RelationType.MANY_TO_ONE,
        targetObjectUniversalIdentifier: parentObject.universalIdentifier,
      })
    ) {
      invalidRule(
        t`The field must be a many-to-one relation from the object to its parent`,
      );
    }

    if (
      isDefined(rule.junctionFieldMetadataUniversalIdentifier) &&
      !isJunctionPathOf({
        field,
        junctionField,
        objectUniversalIdentifier: childObject.universalIdentifier,
        parentObjectUniversalIdentifier: parentObject.universalIdentifier,
      })
    ) {
      invalidRule(
        t`The field must reach the parent through a junction object relation`,
      );
    }

    const isDuplicate = Object.values(
      flatRecordInheritanceRuleMaps.byUniversalIdentifier,
    ).some(
      (existingRule) =>
        isDefined(existingRule) &&
        existingRule.universalIdentifier !== rule.universalIdentifier &&
        existingRule.objectMetadataUniversalIdentifier ===
          rule.objectMetadataUniversalIdentifier &&
        existingRule.fieldMetadataUniversalIdentifier ===
          rule.fieldMetadataUniversalIdentifier &&
        (existingRule.junctionFieldMetadataUniversalIdentifier ?? null) ===
          (rule.junctionFieldMetadataUniversalIdentifier ?? null),
    );

    if (isDuplicate) {
      invalidRule(t`This related records rule already exists`);
    }

    return validationResult;
  }

  validateFlatRecordInheritanceRuleUpdate({
    universalIdentifier,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.recordInheritanceRule
  >): FailedFlatEntityValidation<'recordInheritanceRule', 'update'> {
    return getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: { universalIdentifier },
      metadataName: 'recordInheritanceRule',
      type: 'update',
    });
  }

  validateFlatRecordInheritanceRuleDeletion({
    flatEntityToValidate,
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.recordInheritanceRule
  >): FailedFlatEntityValidation<'recordInheritanceRule', 'delete'> {
    return getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
      },
      metadataName: 'recordInheritanceRule',
      type: 'delete',
    });
  }
}
