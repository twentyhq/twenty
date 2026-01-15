import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { FrontComponentExceptionCode } from 'src/engine/metadata-modules/front-component/front-component.exception';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-update-validation-args.type';
import { type FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-args.type';

@Injectable()
export class FlatFrontComponentValidatorService {
  public validateFlatFrontComponentCreation({
    flatEntityToValidate: flatFrontComponent,
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.frontComponent
  >): FailedFlatEntityValidation<'frontComponent', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatFrontComponent.id,
        universalIdentifier: flatFrontComponent.universalIdentifier,
        name: flatFrontComponent.name,
      },
      metadataName: 'frontComponent',
      type: 'create',
    });

    if (!isNonEmptyString(flatFrontComponent.name)) {
      validationResult.errors.push({
        code: FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
        message: t`Front component name is required`,
        userFriendlyMessage: msg`Front component name is required`,
      });
    }

    return validationResult;
  }

  public validateFlatFrontComponentDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatFrontComponentMaps: optimisticFlatFrontComponentMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.frontComponent
  >): FailedFlatEntityValidation<'frontComponent', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatEntityToValidate.id,
        universalIdentifier: flatEntityToValidate.universalIdentifier,
        name: flatEntityToValidate.name,
      },
      metadataName: 'frontComponent',
      type: 'delete',
    });

    const existingFrontComponent = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatEntityToValidate.id,
      flatEntityMaps: optimisticFlatFrontComponentMaps,
    });

    if (!isDefined(existingFrontComponent)) {
      validationResult.errors.push({
        code: FrontComponentExceptionCode.FRONT_COMPONENT_NOT_FOUND,
        message: t`Front component not found`,
        userFriendlyMessage: msg`Front component not found`,
      });

      return validationResult;
    }

    return validationResult;
  }

  public validateFlatFrontComponentUpdate({
    flatEntityId,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatFrontComponentMaps: optimisticFlatFrontComponentMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.frontComponent
  >): FailedFlatEntityValidation<'frontComponent', 'update'> {
    const fromFlatFrontComponent = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId,
      flatEntityMaps: optimisticFlatFrontComponentMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatEntityId,
        universalIdentifier: fromFlatFrontComponent?.universalIdentifier,
      },
      metadataName: 'frontComponent',
      type: 'update',
    });

    if (!isDefined(fromFlatFrontComponent)) {
      validationResult.errors.push({
        code: FrontComponentExceptionCode.FRONT_COMPONENT_NOT_FOUND,
        message: t`Front component not found`,
        userFriendlyMessage: msg`Front component not found`,
      });

      return validationResult;
    }

    return validationResult;
  }
}
